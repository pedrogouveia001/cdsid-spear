unit uSessionManager;

interface

uses
  Classes, SysUtils, SyncObjs, uTypes;

type

  TSession = class
  public
    Token: string;
    UserId: Integer;
    Email: string;
    CriteriaOrder: TIntArray;
    LastAccess: TDateTime;
    constructor Create;
  end;

  TSessionManager = class
  private
    FList: TList;
    FLock: TCriticalSection;
    function GenerateToken: string;
  public
    constructor Create;
    destructor Destroy; override;
    function CreateSession(UserId: Integer; const Email: string): string;
    function GetSession(const Token: string; out UserId: Integer; out Email: string; out CriteriaOrder: TIntArray): Boolean;
    procedure SetCriteriaOrder(const Token: string; const CriteriaOrder: TIntArray);
    procedure DeleteSession(const Token: string);
    procedure ClearExpired;
  end;

var
  SessionMgr: TSessionManager;

implementation

{ TSession }

constructor TSession.Create;
begin
  Token := '';
  UserId := -1;
  Email := '';
  SetLength(CriteriaOrder, 0);
  LastAccess := Now;
end;

{ TSessionManager }

constructor TSessionManager.Create;
begin
  FList := TList.Create;
  FLock := TCriticalSection.Create;
end;

destructor TSessionManager.Destroy;
var
  i: Integer;
begin
  FLock.Enter;
  try
    for i := 0 to FList.Count - 1 do
      TSession(FList[i]).Free;
    FList.Free;
  finally
    FLock.Leave;
  end;
  FLock.Free;
  inherited;
end;

function TSessionManager.GenerateToken: string;
var
  Guid: TGuid;
begin
  CreateGuid(Guid);
  Result := GuidToString(Guid);
  Result := StringReplace(Result, '{', '', [rfReplaceAll]);
  Result := StringReplace(Result, '}', '', [rfReplaceAll]);
end;

function TSessionManager.CreateSession(UserId: Integer; const Email: string): string;
var
  Session: TSession;
begin
  FLock.Enter;
  try
    Session := TSession.Create;
    Session.Token := GenerateToken;
    Session.UserId := UserId;
    Session.Email := Email;
    FList.Add(Session);
    Result := Session.Token;
  finally
    FLock.Leave;
  end;
end;

function TSessionManager.GetSession(const Token: string; out UserId: Integer; out Email: string; out CriteriaOrder: TIntArray): Boolean;
var
  i, j: Integer;
  Session: TSession;
begin
  Result := False;
  UserId := -1;
  Email := '';
  SetLength(CriteriaOrder, 0);

  if Token = '' then
    Exit;

  FLock.Enter;
  try
    for i := 0 to FList.Count - 1 do
    begin
      Session := TSession(FList[i]);
      if SameText(Session.Token, Token) then
      begin
        Session.LastAccess := Now;
        UserId := Session.UserId;
        Email := Session.Email;
        
        SetLength(CriteriaOrder, Length(Session.CriteriaOrder));
        for j := 0 to Length(Session.CriteriaOrder) - 1 do
          CriteriaOrder[j] := Session.CriteriaOrder[j];

        Result := True;
        Break;
      end;
    end;
  finally
    FLock.Leave;
  end;
end;

procedure TSessionManager.SetCriteriaOrder(const Token: string; const CriteriaOrder: TIntArray);
var
  i, j: Integer;
  Session: TSession;
begin
  FLock.Enter;
  try
    for i := 0 to FList.Count - 1 do
    begin
      Session := TSession(FList[i]);
      if SameText(Session.Token, Token) then
      begin
        Session.LastAccess := Now;
        SetLength(Session.CriteriaOrder, Length(CriteriaOrder));
        for j := 0 to Length(CriteriaOrder) - 1 do
          Session.CriteriaOrder[j] := CriteriaOrder[j];
        Break;
      end;
    end;
  finally
    FLock.Leave;
  end;
end;

procedure TSessionManager.DeleteSession(const Token: string);
var
  i: Integer;
  Session: TSession;
begin
  FLock.Enter;
  try
    for i := 0 to FList.Count - 1 do
    begin
      Session := TSession(FList[i]);
      if SameText(Session.Token, Token) then
      begin
        Session.Free;
        FList.Delete(i);
        Break;
      end;
    end;
  finally
    FLock.Leave;
  end;
end;

procedure TSessionManager.ClearExpired;
var
  i: Integer;
  Session: TSession;
begin
  FLock.Enter;
  try
    for i := FList.Count - 1 downto 0 do
    begin
      Session := TSession(FList[i]);
      if (Now - Session.LastAccess) > (1.0 / 24.0) then
      begin
        Session.Free;
        FList.Delete(i);
      end;
    end;
  finally
    FLock.Leave;
  end;
end;

initialization
  SessionMgr := TSessionManager.Create;

finalization
  SessionMgr.Free;

end.
