object IWUserSession: TIWUserSession
  OldCreateOrder = False
  Height = 150
  Width = 215
  object ZQuery1: TZQuery
    Connection = ZConnection1
    Params = <>
    Left = 76
    Top = 24
  end
  object ZConnection1: TZConnection
    ControlsCodePage = cCP_UTF16
    HostName = 'localhost'
    Port = 3306
    Database = 'spear'
    User = 'root'
    Password = '123'
    Protocol = 'mysql'
    Left = 76
    Top = 56
  end
end
