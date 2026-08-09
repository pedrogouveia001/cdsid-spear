object frmOptions: TfrmOptions
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
    Templates.Default = 'options_flat.html'
    OnUnknownTag = IWTemplateProcessorHTML1UnknownTag
    Left = 40
    Top = 40
  end
  object btnNewProblem: TIWButton
    Css = 'btn-delphi-action'
    Left = 120
    Top = 100
    Width = 200
    Height = 35
    Caption = 'Register new problem'
    Color = clBtnFace
    FriendlyName = 'btnNewProblem'
    OnClick = btnNewProblemClick
  end
  object btnContinueProblem: TIWButton
    Css = 'btn-delphi-action'
    Left = 120
    Top = 150
    Width = 200
    Height = 35
    Caption = 'Continue a registered issue'
    Color = clBtnFace
    FriendlyName = 'btnContinueProblem'
    OnClick = btnContinueProblemClick
  end
end
