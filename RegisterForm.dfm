object frmRegister: TfrmRegister
  Left = 0
  Top = 0
  Width = 555
  Height = 400
  ConnectionMode = cmAny
  SupportedBrowsers = [brIE, brGecko, brOpera, brSafari, brChrome]

  LayoutMgr = IWTemplateProcessorHTML1
  Height = 400
  Width = 555
  object IWTemplateProcessorHTML1: TIWTemplateProcessorHTML
    TagType = ttIntraWeb
    Templates.Default = 'register_flat.html'
    Left = 40
    Top = 40
  end
  object edtEmail: TIWEdit
    Css = 'input-delphi'
    Left = 120
    Top = 100
    Width = 200
    Height = 21
    FriendlyName = 'edtEmail'
  end
  object edtPassword: TIWEdit
    Css = 'input-delphi'
    Left = 120
    Top = 140
    Width = 200
    Height = 21
    FriendlyName = 'edtPassword'
    PasswordPrompt = True
  end
  object edtConfirm: TIWEdit
    Css = 'input-delphi'
    Left = 120
    Top = 180
    Width = 200
    Height = 21
    FriendlyName = 'edtConfirm'
    PasswordPrompt = True
  end
  object btnRegister: TIWButton
    Css = 'btn-delphi-action'
    Left = 120
    Top = 220
    Width = 75
    Height = 25
    Caption = 'Register'
    Color = clBtnFace
    FriendlyName = 'btnRegister'
    OnClick = btnRegisterClick
  end
end
