program SPEAR;

{$APPTYPE CONSOLE}

uses
  Forms,
  IWMain,
  MainForm in 'MainForm.pas' {frmMain: TIWAppForm},
  LoginForm in 'LoginForm.pas' {frmLogin: TIWAppForm},
  RegisterForm in 'RegisterForm.pas' {frmRegister: TIWAppForm},
  OptionsForm in 'OptionsForm.pas' {frmOptions: TIWAppForm},
  ContinueForm in 'ContinueForm.pas' {frmContinue: TIWAppForm},
  SetupForm in 'SetupForm.pas' {frmSetup: TIWAppForm},
  ResultsForm in 'ResultsForm.pas' {frmResults: TIWAppForm},
  ServerController in 'ServerController.pas' {IWServerController: TIWServerControllerBase},
  UserSessionUnit in 'UserSessionUnit.pas' {IWUserSession: TIWUserSessionBase},
  uTemplateEngine in 'uTemplateEngine.pas',
  uSessionManager in 'uSessionManager.pas',
  uExcelImport in 'uExcelImport.pas',
  uJsonHelper in 'uJsonHelper.pas',
  uSolverCore in 'uSolverCore.pas',
  uPermutations in 'uPermutations.pas',
  uNormalization in 'uNormalization.pas',
  uPromethee in 'uPromethee.pas',
  uSurrogate in 'uSurrogate.pas',
  uStats in 'uStats.pas',
  uDecisionRules in 'uDecisionRules.pas',
  uElicitation in 'uElicitation.pas',
  uSensitivity in 'uSensitivity.pas';

{$R *.res}

begin
  Application.Initialize;
  Application.CreateForm(TformIWMain, formIWMain);
  Application.Run;
end.
