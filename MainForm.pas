unit MainForm;

interface

uses
  Classes, SysUtils, IWAppForm, IWApplication, IWColor, IWTypes,
  Controls, IWVCLBaseControl, IWBaseControl, IWBaseHTMLControl, IWControl,
  IWCompButton, IWTemplateProcessorHTML;

type
  TfrmMain = class(TIWAppForm)
    IWTemplateProcessorHTML1: TIWTemplateProcessorHTML;
    btnGoToLogin: TIWButton;
    btnGoToRegister: TIWButton;
    procedure btnGoToLoginClick(Sender: TObject);
    procedure btnGoToRegisterClick(Sender: TObject);
  public
  end;

implementation

{$R *.dfm}

uses
  LoginForm, RegisterForm;

procedure TfrmMain.btnGoToLoginClick(Sender: TObject);
begin
  TfrmLogin.Create(WebApplication).Show;
end;

procedure TfrmMain.btnGoToRegisterClick(Sender: TObject);
begin
  TfrmRegister.Create(WebApplication).Show;
end;

initialization
  TfrmMain.SetAsMainForm;

end.
