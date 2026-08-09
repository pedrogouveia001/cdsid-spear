unit ServerController;

interface

uses
  SysUtils, Classes, IWServerControllerBase, IWBaseForm, HTTPApp,
  UserSessionUnit, IWApplication, IWAppForm,
  ZConnection, ZDataset, DB, ZCompatibility, DBXJSON, StrUtils, Types,
  uTypes, uTemplateEngine, uSessionManager, uExcelImport, uJsonHelper;

type
  TIWServerController = class(TIWServerControllerBase)
    procedure IWServerControllerBaseNewSession(ASession: TIWApplication;
      var VMainForm: TIWBaseForm);
    procedure IWServerControllerBaseBeforeDispatch(Sender: TObject; Request: TWebRequest;
      Response: TWebResponse; var Handled: Boolean);

  private
    procedure InitDatabase;
    procedure CompileTemplates;
    
  public
    constructor Create(AOwner: TComponent); override;
    function GetDBConn(out Conn: TZConnection; out Query: TZQuery; ConnectDb: Boolean = True): Boolean;
  end;

function UserSession: TIWUserSession;
function IWServerController: TIWServerController;

implementation

{$R *.dfm}

uses
  IWInit, IWGlobal, Math, uSolverCore;

function IWServerController: TIWServerController;
begin
  Result := TIWServerController(GServerController);
end;

function UserSession: TIWUserSession;
begin
  Result := TIWUserSession(WebApplication.Data);
end;

function GetCookieValue(Request: TWebRequest; const Name: string): string;
begin
  if (Request <> nil) and (Request.CookieFields <> nil) then
    Result := Request.CookieFields.Values[Name]
  else
    Result := '';
end;

constructor TIWServerController.Create(AOwner: TComponent);
begin
  inherited;
  // InitDatabase; // Disabled automatic database creation as per user request
  CompileTemplates;
end;

procedure TIWServerController.IWServerControllerBaseNewSession(
  ASession: TIWApplication; var VMainForm: TIWBaseForm);
begin
  ASession.Data := TIWUserSession.Create(nil);
end;

function TIWServerController.GetDBConn(out Conn: TZConnection; out Query: TZQuery; ConnectDb: Boolean = True): Boolean;
begin
  Result := False;
  Conn := TZConnection.Create(nil);
  Conn.Protocol := 'mysql';
  Conn.HostName := 'localhost';
  Conn.Port := 3306;
  Conn.User := 'root';
  Conn.Password := '123';
  if ConnectDb then
    Conn.Database := 'spear';
  Conn.ControlsCodePage := cCP_UTF16;
  
  Query := TZQuery.Create(nil);
  Query.Connection := Conn;
  try
    Conn.Connect;
    Result := True;
  except
    on E: Exception do
    begin
      Query.Free;
      Conn.Free;
      raise;
    end;
  end;
end;

procedure TIWServerController.InitDatabase;
var
  Conn: TZConnection;
  Query: TZQuery;
begin
  try
    GetDBConn(Conn, Query, False);
    try
      Query.SQL.Text := 'CREATE DATABASE IF NOT EXISTS spear;';
      Query.ExecSQL;
      Conn.Disconnect;
      
      Conn.Database := 'spear';
      Conn.Connect;
      
      Query.SQL.Text :=
        'CREATE TABLE IF NOT EXISTS usuario (' +
        '  id INT AUTO_INCREMENT PRIMARY KEY,' +
        '  email VARCHAR(191) UNIQUE NOT NULL,' +
        '  password VARCHAR(255) NOT NULL,' +
        '  validation VARCHAR(255) DEFAULT ''validado''' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
      Query.ExecSQL;
 
      Query.SQL.Text :=
        'CREATE TABLE IF NOT EXISTS problema (' +
        '  id INT AUTO_INCREMENT PRIMARY KEY,' +
        '  nome_problema VARCHAR(255) NOT NULL,' +
        '  data_problema TIMESTAMP DEFAULT CURRENT_TIMESTAMP,' +
        '  ID_usuario INT NOT NULL,' +
        '  racionalidade VARCHAR(255) DEFAULT ''compensatory'',' +
        '  FOREIGN KEY(ID_usuario) REFERENCES usuario(id) ON DELETE CASCADE' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
      Query.ExecSQL;
 
      Query.SQL.Text :=
        'CREATE TABLE IF NOT EXISTS criterio (' +
        '  id INT AUTO_INCREMENT PRIMARY KEY,' +
        '  nome_criterio VARCHAR(255) NOT NULL,' +
        '  tipo_criterio INT NOT NULL,' +
        '  niveis INT NOT NULL,' +
        '  ID_problema INT NOT NULL,' +
        '  FOREIGN KEY(ID_problema) REFERENCES problema(id) ON DELETE CASCADE' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
      Query.ExecSQL;
 
      Query.SQL.Text :=
        'CREATE TABLE IF NOT EXISTS alternativa (' +
        '  id INT AUTO_INCREMENT PRIMARY KEY,' +
        '  nome_alternativa VARCHAR(255) NOT NULL,' +
        '  ID_problema INT NOT NULL,' +
        '  FOREIGN KEY(ID_problema) REFERENCES problema(id) ON DELETE CASCADE' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
      Query.ExecSQL;
 
      Query.SQL.Text :=
        'CREATE TABLE IF NOT EXISTS matrizconsequencia (' +
        '  id INT AUTO_INCREMENT PRIMARY KEY,' +
        '  ID_alternativa INT NOT NULL,' +
        '  ID_criterio INT NOT NULL,' +
        '  valor_performance DOUBLE NOT NULL,' +
        '  ID_problema INT NOT NULL,' +
        '  FOREIGN KEY(ID_alternativa) REFERENCES alternativa(id) ON DELETE CASCADE,' +
        '  FOREIGN KEY(ID_criterio) REFERENCES criterio(id) ON DELETE CASCADE,' +
        '  FOREIGN KEY(ID_problema) REFERENCES problema(id) ON DELETE CASCADE' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
      Query.ExecSQL;
 
      Query.SQL.Text :=
        'CREATE TABLE IF NOT EXISTS avaliacaoholistica (' +
        '  id INT AUTO_INCREMENT PRIMARY KEY,' +
        '  ID_problema INT NOT NULL,' +
        '  alt1_nome VARCHAR(255) NOT NULL,' +
        '  alt2_nome VARCHAR(255) NOT NULL,' +
        '  tipo_relacao VARCHAR(255) NOT NULL,' +
        '  fictitious_value DOUBLE DEFAULT NULL,' +
        '  FOREIGN KEY(ID_problema) REFERENCES problema(id) ON DELETE CASCADE' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
      Query.ExecSQL;
 
      Query.SQL.Text :=
        'CREATE TABLE IF NOT EXISTS decomposicaopreferencia (' +
        '  id INT AUTO_INCREMENT PRIMARY KEY,' +
        '  ID_problema INT NOT NULL,' +
        '  criterio_a VARCHAR(255) NOT NULL,' +
        '  criterio_b VARCHAR(255) NOT NULL,' +
        '  tipo_relacao VARCHAR(255) NOT NULL,' +
        '  valor_ratio DOUBLE NOT NULL,' +
        '  FOREIGN KEY(ID_problema) REFERENCES problema(id) ON DELETE CASCADE' +
        ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
      Query.ExecSQL;
 
    finally
      Query.Free;
      Conn.Free;
    end;
  except
    on E: Exception do
      WriteLn('[DB INIT ERROR]: ' + E.Message);
  end;
end;

procedure TIWServerController.CompileTemplates;
var
  SL: TStringList;
  FlatHtml: string;
  TemplatesPath: string;
begin
  TemplatesPath := ExtractFilePath(ParamStr(0)) + 'templates' + PathDelim;
  SL := TStringList.Create;
  try
    FlatHtml := RenderTemplate('login.html', '');
    SL.Text := FlatHtml;
    SL.SaveToFile(TemplatesPath + 'login_flat.html', TEncoding.UTF8);

    FlatHtml := RenderTemplate('register.html', '');
    SL.Text := FlatHtml;
    SL.SaveToFile(TemplatesPath + 'register_flat.html', TEncoding.UTF8);

    FlatHtml := RenderTemplate('options.html', '{%lblUserEmail%}');
    SL.Text := FlatHtml;
    SL.SaveToFile(TemplatesPath + 'options_flat.html', TEncoding.UTF8);

    FlatHtml := RenderTemplate('continue.html', '{%lblUserEmail%}');
    SL.Text := FlatHtml;
    SL.SaveToFile(TemplatesPath + 'continue_flat.html', TEncoding.UTF8);

    FlatHtml := RenderTemplate('setup.html', '{%lblUserEmail%}');
    SL.Text := FlatHtml;
    SL.SaveToFile(TemplatesPath + 'setup_flat.html', TEncoding.UTF8);

    FlatHtml := RenderTemplate('results.html', '{%lblUserEmail%}');
    SL.Text := FlatHtml;
    SL.SaveToFile(TemplatesPath + 'results_flat.html', TEncoding.UTF8);

    FlatHtml := RenderTemplate('welcome.html', '');
    SL.Text := FlatHtml;
    SL.SaveToFile(TemplatesPath + 'welcome_flat.html', TEncoding.UTF8);
  finally
    SL.Free;
  end;
end;

procedure TIWServerController.IWServerControllerBaseBeforeDispatch(Sender: TObject; Request: TWebRequest;
  Response: TWebResponse; var Handled: Boolean);
var
  Url, Token, Email, StaticPath, Ext, RespJson, TempFilePath: string;
  UserId: Integer;
  CriteriaOrder: TIntArray;
  CookieList: TStringList;
  FS: TFileStream;
  JsonObj: TJSONObject;
  ImpRes: TImportedData;
  ReqJson: string;
begin
  WriteLn('--> BeforeDispatch URL: ' + Request.URL);
  Url := Request.URL;
  Handled := False;

  Token := GetCookieValue(Request, 'spear_session');
  Email := '';
  UserId := -1;
  SetLength(CriteriaOrder, 0);

  if Token <> '' then
  begin
    SessionMgr.GetSession(Token, UserId, Email, CriteriaOrder);
  end;

  // Serve static assets
  if StartsText('/static/', Url) then
  begin
    StaticPath := ExtractFilePath(ParamStr(0)) + StringReplace(Url, '/', PathDelim, [rfReplaceAll]);
    if FileExists(StaticPath) then
    begin
      Ext := LowerCase(ExtractFileExt(StaticPath));
      if Ext = '.css' then Response.ContentType := 'text/css'
      else if Ext = '.js' then Response.ContentType := 'application/javascript'
      else if (Ext = '.png') or (Ext = '.gif') or (Ext = '.jpg') or (Ext = '.jpeg') then
        Response.ContentType := 'image/' + Copy(Ext, 2, Length(Ext))
      else Response.ContentType := 'application/octet-stream';
      
      FS := TFileStream.Create(StaticPath, fmOpenRead or fmShareDenyWrite);
      Response.ContentStream := FS;
      Response.SendResponse;
      Handled := True;
    end
    else
    begin
      Response.StatusCode := 404;
      Response.Content := 'File not found.';
      Response.SendResponse;
      Handled := True;
    end;
    Exit;
  end;

  // Handle Logout
  if Url = '/logout' then
  begin
    if Token <> '' then
      SessionMgr.DeleteSession(Token);
    CookieList := TStringList.Create;
    try
      CookieList.Add('spear_session=');
      Response.SetCookieField(CookieList, '', '', Now - 100, False);
    finally
      CookieList.Free;
    end;
    Response.StatusCode := 302;
    Response.SetCustomHeader('Location', '/');
    Response.SendResponse;
    Handled := True;
    Exit;
  end;

  // Stateless API intercepts (e.g. client log and file import)
  if StartsText('/api/', Url) or (SameText(Request.Method, 'OPTIONS')) then
  begin
    Response.SetCustomHeader('Access-Control-Allow-Origin', '*');
    Response.SetCustomHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    Response.SetCustomHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');

    if SameText(Request.Method, 'OPTIONS') then
    begin
      Response.StatusCode := 200;
      Response.Content := '';
      Response.SendResponse;
      Handled := True;
      Exit;
    end;

    ReqJson := Request.Content;
    Response.ContentType := 'application/json';
    
    if Url = '/api/log' then
    begin
      JsonObj := ParseJson(ReqJson);
      if JsonObj <> nil then
      try
        WriteLn('[CLIENT LOG]: ' + GetStr(JsonObj, 'message'));
      finally
        JsonObj.Free;
      end;
      Response.Content := '{"success":true}';
      Response.SendResponse;
      Handled := True;
      Exit;
    end;

    if Url = '/api/solve' then
    begin
      try
        SolveProblemCore(ReqJson, RespJson);
        Response.Content := RespJson;
      except
        on E: Exception do
          Response.Content := '{"success":false,"error":"' + EscapeJson(E.Message) + '"}';
      end;
      Response.SendResponse;
      Handled := True;
      Exit;
    end;

    if Url = '/api/sensitivity' then
    begin
      try
        RunSensitivityCore(ReqJson, RespJson);
        Response.Content := RespJson;
      except
        on E: Exception do
          Response.Content := '{"success":false,"error":"' + EscapeJson(E.Message) + '"}';
      end;
      Response.SendResponse;
      Handled := True;
      Exit;
    end;

    if Url = '/api/import' then
    begin
      if Request.Files.Count > 0 then
      begin
        TempFilePath := ExtractFilePath(ParamStr(0)) + Request.Files[0].FileName;
        Request.Files[0].Stream.Position := 0;
        FS := TFileStream.Create(TempFilePath, fmCreate);
        try
          FS.CopyFrom(Request.Files[0].Stream, Request.Files[0].Stream.Size);
        finally
          FS.Free;
        end;
        
        ImpRes := ImportFile(TempFilePath);
        DeleteFile(TempFilePath);
        
        if ImpRes.Success then
        begin
          RespJson := Format(
            '{"success":true,"criteria":%s,"criterionTypes":%s,"levels":%s,"alternatives":%s,"matrix":%s}',
            [StringListToJson(ImpRes.Criteria),
             IntArrayToJson(ImpRes.CriterionTypes),
             IntArrayToJson(ImpRes.Levels),
             StringListToJson(ImpRes.Alternatives),
             T2DDoubleArrayToJson(ImpRes.Matrix)]
          );
          ImpRes.Criteria.Free;
          ImpRes.Alternatives.Free;
        end
        else
        begin
          RespJson := '{"success":false,"error":"' + EscapeJson(ImpRes.ErrorMsg) + '"}';
          ImpRes.Criteria.Free;
          ImpRes.Alternatives.Free;
        end;
      end
      else
        RespJson := '{"success":false,"error":"No file uploaded"}';

      Response.Content := RespJson;
      Response.SendResponse;
      Handled := True;
      Exit;
    end;
  end;
end;

initialization
  TIWServerController.SetServerControllerClass;

end.
