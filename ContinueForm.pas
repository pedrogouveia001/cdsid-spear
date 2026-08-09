unit ContinueForm;

interface

uses
  Classes, SysUtils, IWAppForm, IWApplication, IWColor, IWTypes,
  Controls, IWVCLBaseControl, IWBaseControl, IWBaseHTMLControl, IWControl,
  IWCompEdit, IWCompButton, IWTemplateProcessorHTML, DB, ZDataset, ZConnection;

type
  TfrmContinue = class(TIWAppForm)
    IWTemplateProcessorHTML1: TIWTemplateProcessorHTML;
    edtSelectedProblemId: TIWEdit;
    btnSelect: TIWButton;
    btnBack: TIWButton;
    procedure btnSelectClick(Sender: TObject);
    procedure btnBackClick(Sender: TObject);
    procedure IWTemplateProcessorHTML1UnknownTag(const AName: string;
      var AValue: string);
  public
  end;

implementation

{$R *.dfm}

uses
  ServerController, UserSessionUnit, SetupForm, OptionsForm, uJsonHelper, uSolverCore;

procedure TfrmContinue.btnBackClick(Sender: TObject);
begin
  TfrmOptions.Create(WebApplication).Show;
end;

procedure TfrmContinue.btnSelectClick(Sender: TObject);
var
  ProblemId: Integer;
  LoadedJson: string;
begin
  ProblemId := StrToIntDef(Trim(edtSelectedProblemId.Text), 0);
  if ProblemId = 0 then
  begin
    WebApplication.ShowMessage('Por favor, selecione um problema.');
    Exit;
  end;

  if LoadProblemCore(ProblemId, UserSession.UserId, LoadedJson) then
  begin
    UserSession.LoadedProblemJson := LoadedJson;
    TfrmSetup.Create(WebApplication).Show;
  end
  else
  begin
    WebApplication.ShowMessage('Erro ao carregar o problema.');
  end;
end;

procedure TfrmContinue.IWTemplateProcessorHTML1UnknownTag(const AName: string;
  var AValue: string);
var
  Conn: TZConnection;
  Query: TZQuery;
  ListHtml: string;
begin
  if AName = 'lblUserEmail' then
  begin
    AValue := UserSession.UserEmail;
    Exit;
  end;

  if AName = 'edtSelectedProblemId.HTMLName' then
  begin
    AValue := edtSelectedProblemId.HTMLName;
    Exit;
  end;

  if AName = 'btnSelect.HTMLName' then
  begin
    AValue := btnSelect.HTMLName;
    Exit;
  end;

  if AName = 'ProblemList' then
  begin
    ListHtml := '';
    if IWServerController.GetDBConn(Conn, Query) then
    try
      Query.SQL.Text := 'SELECT id, nome_problema, data_problema FROM problema WHERE ID_usuario = :UserId ORDER BY data_problema DESC';
      Query.ParamByName('UserId').AsInteger := UserSession.UserId;
      Query.Open;

      if Query.Eof then
      begin
        ListHtml := '<div class="problem-option disabled" data-i18n="no_saved_problems">No saved problems found. Please register a new problem.</div>';
      end
      else
      begin
        while not Query.Eof do
        begin
          ListHtml := ListHtml + Format(
            '<div class="problem-option" data-value="%d">%s (Saved on: %s)</div>',
            [Query.FieldByName('id').AsInteger,
             Query.FieldByName('nome_problema').AsString,
             DateTimeToStr(Query.FieldByName('data_problema').AsDateTime)]
          );
          Query.Next;
        end;
      end;
    finally
      Query.Free;
      Conn.Free;
    end
    else
    begin
      ListHtml := '<div class="problem-option disabled">Error connecting to database.</div>';
    end;
    AValue := ListHtml;
  end;
end;

end.
