object frmSetup: TfrmSetup
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
    Templates.Default = 'setup_flat.html'
    OnUnknownTag = IWTemplateProcessorHTML1UnknownTag
    Left = 40
    Top = 40
  end
  object edtProblemData: TIWMemo
    Left = 120
    Top = 100
    Width = 200
    Height = 80
    FriendlyName = 'edtProblemData'
  end
  object edtActionType: TIWEdit
    Css = 'input-delphi'
    Left = 120
    Top = 200
    Width = 200
    Height = 21
    FriendlyName = 'edtActionType'
  end
  object btnTrigger: TIWButton
    Css = 'btn-delphi-action'
    Left = 120
    Top = 240
    Width = 75
    Height = 25
    Caption = 'Trigger'
    Color = clBtnFace
    FriendlyName = 'btnTrigger'
    OnClick = btnTriggerClick
  end
  object btnBack: TIWButton
    Css = 'btn-delphi-action'
    Left = 120
    Top = 280
    Width = 75
    Height = 25
    Caption = '<< Back'
    Color = clBtnFace
    FriendlyName = 'btnBack'
    OnClick = btnBackClick
  end
end
