unit ResultsForm;

interface

uses
  Classes, SysUtils, IWAppForm, IWApplication, IWColor, IWTypes,
  Controls, IWVCLBaseControl, IWBaseControl, IWBaseHTMLControl, IWControl,
  IWCompEdit, IWCompMemo, IWCompButton, IWTemplateProcessorHTML;

type
  TfrmResults = class(TIWAppForm)
    IWTemplateProcessorHTML1: TIWTemplateProcessorHTML;
    memResultsJson: TIWMemo;
    memElicitationInput: TIWMemo;
    memSensitivityInput: TIWMemo;
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
  ServerController, UserSessionUnit, SetupForm, uSolverCore, uJsonHelper, DBXJSON;

procedure TfrmResults.btnBackClick(Sender: TObject);
var
  JsonObj: TJSONObject;
  ProblemId: Integer;
  LoadedJson: string;
begin
  ProblemId := 0;
  JsonObj := ParseJson(UserSession.ResultsJson);
  if JsonObj <> nil then
  try
    ProblemId := GetInt(JsonObj, 'problemId', 0);
  finally
    JsonObj.Free;
  end;

  if (ProblemId > 0) and LoadProblemCore(ProblemId, UserSession.UserId, LoadedJson) then
  begin
    UserSession.LoadedProblemJson := LoadedJson;
  end;
  
  TfrmSetup.Create(WebApplication).Show;
end;

procedure TfrmResults.btnTriggerClick(Sender: TObject);
var
  Action: string;
  ReqJson: string;
  RespJson: string;
  ProblemId: Integer;
  JsonObj: TJSONObject;
begin
  Action := LowerCase(Trim(edtActionType.Text));
  
  if Action = 'elicitation' then
  begin
    ReqJson := Trim(memElicitationInput.Text);
    if ReqJson = '' then Exit;
    
    // Parse problemId to preserve it
    ProblemId := 0;
    JsonObj := ParseJson(UserSession.ResultsJson);
    if JsonObj <> nil then
    try
      ProblemId := GetInt(JsonObj, 'problemId', 0);
    finally
      JsonObj.Free;
    end;

    // Run solver
    SolveProblemCore(ReqJson, UserSession.ResultsJson);
    
    // Re-inject ProblemId
    if ProblemId > 0 then
    begin
      UserSession.ResultsJson := StringReplace(
        UserSession.ResultsJson,
        '"success":true',
        Format('"success":true,"problemId":%d', [ProblemId]),
        [rfReplaceAll]
      );
    end;
    
    // Clear sensitivity when elicitation choices change
    UserSession.SensitivityJson := '';

    // Reload form to refresh results page
    TfrmResults.Create(WebApplication).Show;
  end
  else if Action = 'sensitivity' then
  begin
    ReqJson := Trim(memSensitivityInput.Text);
    if ReqJson = '' then Exit;
    
    // Run sensitivity analysis Monte Carlo simulation
    RunSensitivityCore(ReqJson, UserSession.SensitivityJson);
    
    // Reload form to render sensitivity charts
    TfrmResults.Create(WebApplication).Show;
  end;
end;

procedure TfrmResults.IWTemplateProcessorHTML1UnknownTag(const AName: string;
  var AValue: string);
begin
  if AName = 'lblUserEmail' then
  begin
    AValue := UserSession.UserEmail;
    Exit;
  end;

  if AName = 'memResultsJson.HTMLName' then
  begin
    AValue := memResultsJson.HTMLName;
    Exit;
  end;

  if AName = 'memElicitationInput.HTMLName' then
  begin
    AValue := memElicitationInput.HTMLName;
    Exit;
  end;

  if AName = 'memSensitivityInput.HTMLName' then
  begin
    AValue := memSensitivityInput.HTMLName;
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

  if AName = 'ResultsDataScript' then
  begin
    AValue := '<script>' +
              'const resultsData = ' + UserSession.ResultsJson + ';' +
              'sessionStorage.setItem("spearResults", JSON.stringify(resultsData));';
              
    if UserSession.SensitivityJson <> '' then
    begin
      AValue := AValue + 'window.lastASResult = ' + UserSession.SensitivityJson + ';';
      // Clear it so it doesn't persist across pages
      UserSession.SensitivityJson := '';
    end;
    
    AValue := AValue + '</script>';
  end;
end;

end.
