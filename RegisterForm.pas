unit RegisterForm;

interface

uses
  Classes, SysUtils, IWAppForm, IWApplication, IWColor, IWTypes,
  Controls, IWVCLBaseControl, IWBaseControl, IWBaseHTMLControl, IWControl,
  IWCompEdit, IWCompButton, IWTemplateProcessorHTML, HTTPApp, DB, ZDataset, ZConnection,
  UserSessionUnit;

type
  TfrmRegister = class(TIWAppForm)
    IWTemplateProcessorHTML1: TIWTemplateProcessorHTML;
    edtEmail: TIWEdit;
    edtPassword: TIWEdit;
    edtConfirm: TIWEdit;
    btnRegister: TIWButton;
    procedure btnRegisterClick(Sender: TObject);
  public
  end;

implementation

{$R *.dfm}

uses
  ServerController, LoginForm;

procedure TfrmRegister.btnRegisterClick(Sender: TObject);
var
  Email, Password, Confirm: string;
  Conn: TZConnection;
  Query: TZQuery;
begin
  Email := Trim(edtEmail.Text);
  Password := Trim(edtPassword.Text);
  Confirm := Trim(edtConfirm.Text);
  
  if (Email = '') or (Password = '') or (Confirm = '') then
  begin
    WebApplication.ShowMessage('Por favor, preencha todos os campos.');
    Exit;
  end;
  
  if Password <> Confirm then
  begin
    WebApplication.ShowMessage('As senhas não coincidem.');
    Exit;
  end;
  
  if not IWServerController.GetDBConn(Conn, Query) then
  begin
    WebApplication.ShowMessage('Erro de conexão com o banco de dados.');
    Exit;
  end;
  
  try
    try
      Query.SQL.Text := 'INSERT INTO usuario (email, password, validation) VALUES (:email, :password, ''validado'')';
      Query.ParamByName('email').AsString := Email;
      Query.ParamByName('password').AsString := Password;
      Query.ExecSQL;
      
      WebApplication.ShowMessage('Cadastro realizado com sucesso! Faça login para continuar.');
      TfrmLogin.Create(WebApplication).Show;
    except
      on E: Exception do
      begin
        WebApplication.ShowMessage('Este email já está cadastrado ou ocorreu um erro.');
      end;
    end;
  finally
    Query.Free;
    Conn.Free;
  end;
end;

end.
