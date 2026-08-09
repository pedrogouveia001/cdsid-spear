object frmContinue: TfrmContinue
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
    Templates.Default = 'continue_flat.html'
    OnUnknownTag = IWTemplateProcessorHTML1UnknownTag
    Left = 40
    Top = 40
  end
  object edtSelectedProblemId: TIWEdit
    Css = 'input-delphi'
    Left = 120
    Top = 100
    Width = 200
    Height = 21
    FriendlyName = 'edtSelectedProblemId'
  end
  object btnSelect: TIWButton
    Css = 'btn-delphi-action'
    Left = 120
    Top = 140
    Width = 75
    Height = 25
    Caption = 'Select'
    Color = clBtnFace
    FriendlyName = 'btnSelect'
    OnClick = btnSelectClick
  end
  object btnBack: TIWButton
    Css = 'btn-delphi-action'
    Left = 40
    Top = 140
    Width = 75
    Height = 25
    Caption = 'Back'
    Color = clBtnFace
    FriendlyName = 'btnBack'
    OnClick = btnBackClick
  end
end
