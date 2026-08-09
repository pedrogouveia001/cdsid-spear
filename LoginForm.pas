unit LoginForm;

interface

uses
  Classes, SysUtils, IWAppForm, IWApplication, IWColor, IWTypes,
  Controls, IWVCLBaseControl, IWBaseControl, IWBaseHTMLControl, IWControl,
  IWCompEdit, IWCompButton, IWTemplateProcessorHTML, HTTPApp, DB, ZDataset, ZConnection,
  UserSessionUnit;

type
  TfrmLogin = class(TIWAppForm)
    IWTemplateProcessorHTML1: TIWTemplateProcessorHTML;
    edtEmail: TIWEdit;
    edtPassword: TIWEdit;
    btnLogin: TIWButton;
    procedure btnLoginClick(Sender: TObject);
  public
  end;

implementation

{$R *.dfm}

uses
  ServerController, OptionsForm, uSessionManager;

procedure TfrmLogin.btnLoginClick(Sender: TObject);
var
  Email, Password, Token: string;
  Conn: TZConnection;
  Query: TZQuery;
  UserId: Integer;
begin
  Email := Trim(edtEmail.Text);
  Password := Trim(edtPassword.Text);
  
  if (Email = '') or (Password = '') then
  begin
    WebApplication.ShowMessage('Por favor, preencha todos os campos.');
    Exit;
  end;
  
  if not IWServerController.GetDBConn(Conn, Query) then
  begin
    WebApplication.ShowMessage('Erro de conexão com o banco de dados.');
    Exit;
  end;
  
  try
    Query.SQL.Text := 'SELECT id FROM usuario WHERE email = :email AND password = :password';
    Query.ParamByName('email').AsString := Email;
    Query.ParamByName('password').AsString := Password;
    Query.Open;
    
    if not Query.Eof then
    begin
      UserId := Query.FieldByName('id').AsInteger;
      Query.Close;
      
      // Save session in memory session manager
      Token := SessionMgr.CreateSession(UserId, Email);
      
      // Store in UserSession
      UserSession.UserId := UserId;
      UserSession.UserEmail := Email;
      UserSession.SessionToken := Token;
      
      // Navigate to OptionsForm
      TfrmOptions.Create(WebApplication).Show;
    end
    else
    begin
      WebApplication.ShowMessage('Email ou senha inválidos.');
    end;
  finally
    Query.Free;
    Conn.Free;
  end;
end;

end.
