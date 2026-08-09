unit OptionsForm;

interface

uses
  Classes, SysUtils, IWAppForm, IWApplication, IWColor, IWTypes,
  Controls, IWVCLBaseControl, IWBaseControl, IWBaseHTMLControl, IWControl,
  IWCompButton, IWTemplateProcessorHTML;

type
  TfrmOptions = class(TIWAppForm)
    IWTemplateProcessorHTML1: TIWTemplateProcessorHTML;
    btnNewProblem: TIWButton;
    btnContinueProblem: TIWButton;
    procedure btnNewProblemClick(Sender: TObject);
    procedure btnContinueProblemClick(Sender: TObject);
    procedure IWTemplateProcessorHTML1UnknownTag(const AName: string;
      var AValue: string);
  public
  end;

implementation

{$R *.dfm}

uses
  SetupForm, ContinueForm, ServerController;

procedure TfrmOptions.btnNewProblemClick(Sender: TObject);
begin
  TfrmSetup.Create(WebApplication).Show;
end;

procedure TfrmOptions.btnContinueProblemClick(Sender: TObject);
begin
  TfrmContinue.Create(WebApplication).Show;
end;

procedure TfrmOptions.IWTemplateProcessorHTML1UnknownTag(const AName: string;
  var AValue: string);
begin
  if AName = 'lblUserEmail' then
    AValue := UserSession.UserEmail;
end;

end.
