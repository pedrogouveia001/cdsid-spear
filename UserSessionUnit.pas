unit UserSessionUnit;

interface

uses
  IWUserSessionBase, SysUtils, Classes, DB, ZAbstractRODataset,
  ZAbstractDataset, ZDataset, ZAbstractConnection, ZConnection;

type
  TIWUserSession = class(TIWUserSessionBase)
    ZQuery1: TZQuery;
    ZConnection1: TZConnection;
  private
    { Private declarations }
  public
    UserId: Integer;
    UserEmail: string;
    SessionToken: string;
    CriteriaOrder: array of Integer;
    LoadedProblemJson: string;
    ResultsJson: string;
    SensitivityJson: string;
  end;

implementation

{$R *.dfm}

end.
