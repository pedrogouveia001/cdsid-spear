unit SetupForm;

interface

uses
  Classes, SysUtils, IWAppForm, IWApplication, IWColor, IWTypes,
  Controls, IWVCLBaseControl, IWBaseControl, IWBaseHTMLControl, IWControl,
  IWCompEdit, IWCompMemo, IWCompButton, IWTemplateProcessorHTML;

type
  TfrmSetup = class(TIWAppForm)
    IWTemplateProcessorHTML1: TIWTemplateProcessorHTML;
    edtProblemData: TIWMemo;
    edtActionType: TIWEdit;
    btnTrigger: TIWButton;
    btnBack: TIWButton;
    procedure btnTriggerClick(Sender: TObject);
    procedure btnBackClick(Sender: TObject);
    procedure IWTemplateProcessorHTML1UnknownTag(const AName: string;
      var AValue: string);
  public
  end;

implementation

{$R *.dfm}

uses
  ServerController, UserSessionUnit, OptionsForm, ResultsForm, uSolverCore, uJsonHelper;

procedure TfrmSetup.btnBackClick(Sender: TObject);
begin
  TfrmOptions.Create(WebApplication).Show;
end;

procedure TfrmSetup.btnTriggerClick(Sender: TObject);
var
  ReqJson: string;
  Action: string;
  ProblemId: Integer;
  ErrorMsg: string;
  SavedOk: Boolean;
begin
  ReqJson := Trim(edtProblemData.Text);
  Action := LowerCase(Trim(edtActionType.Text));
  
  if ReqJson = '' then
  begin
    WebApplication.ShowMessage('Dados do problema vazios.');
    Exit;
  end;

  ProblemId := 0;
  SavedOk := SaveProblemCore(ReqJson, UserSession.UserId, ProblemId, ErrorMsg);
  
  if not SavedOk then
  begin
    WebApplication.ShowMessage('Erro ao salvar o problema: ' + ErrorMsg);
    Exit;
  end;

  if Action = 'save' then
  begin
    // Update the local LoadedProblemJson with the updated problem ID and info
    // We can rebuild the JSON with the new problem ID
    UserSession.LoadedProblemJson := StringReplace(
      ReqJson, 
      '"problemId":null', 
      Format('"problemId":%d', [ProblemId]), 
      [rfReplaceAll, rfIgnoreCase]
    );
    // If it already had a problemId, it remains
    if Pos('"problemId":', ReqJson) = 0 then
    begin
      // Insert problemId into JSON if missing
      UserSession.LoadedProblemJson := StringReplace(
        UserSession.LoadedProblemJson,
        '{',
        Format('{"problemId":%d,', [ProblemId]),
        []
      );
    end;

    WebApplication.ShowMessage('Problema salvo com sucesso!');
    // Re-show SetupForm to refresh page scripts
    TfrmSetup.Create(WebApplication).Show;
  end
  else if Action = 'solve' then
  begin
    // Run solver math engine
    SolveProblemCore(ReqJson, UserSession.ResultsJson);
    
    // Inject the problem ID into Results JSON so the results page knows it
    UserSession.ResultsJson := StringReplace(
      UserSession.ResultsJson,
      '"success":true',
      Format('"success":true,"problemId":%d', [ProblemId]),
      [rfReplaceAll]
    );

    // Navigate to ResultsForm
    TfrmResults.Create(WebApplication).Show;
  end;
end;

procedure TfrmSetup.IWTemplateProcessorHTML1UnknownTag(const AName: string;
  var AValue: string);
begin
  if AName = 'lblUserEmail' then
  begin
    AValue := UserSession.UserEmail;
    Exit;
  end;

  if AName = 'edtProblemData.HTMLName' then
  begin
    AValue := edtProblemData.HTMLName;
    Exit;
  end;

  if AName = 'edtActionType.HTMLName' then
  begin
    AValue := edtActionType.HTMLName;
    Exit;
  end;

  if AName = 'btnTrigger.HTMLName' then
  begin
    AValue := btnTrigger.HTMLName;
    Exit;
  end;

  if AName = 'LoadedProblemDataScript' then
  begin
    if UserSession.LoadedProblemJson <> '' then
    begin
      AValue := '<script>window.loadedProblemData = ' + UserSession.LoadedProblemJson + ';</script>';
      // Clear it so new problems start empty
      UserSession.LoadedProblemJson := '';
    end
    else
      AValue := '';
  end;
end;

end.
