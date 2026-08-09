object frmMain: TfrmMain
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
    Templates.Default = 'welcome_flat.html'
    Left = 40
    Top = 40
  end
  object btnGoToLogin: TIWButton
    Css = 'btn-delphi-action'
    Left = 120
    Top = 100
    Width = 120
    Height = 35
    Caption = 'Login'
    Color = clBtnFace
    FriendlyName = 'btnGoToLogin'
    OnClick = btnGoToLoginClick
  end
  object btnGoToRegister: TIWButton
    Css = 'btn-delphi-action'
    Left = 120
    Top = 150
    Width = 120
    Height = 35
    Caption = 'Register user'
    Color = clBtnFace
    FriendlyName = 'btnGoToRegister'
    OnClick = btnGoToRegisterClick
  end
end
