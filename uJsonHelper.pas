unit uJsonHelper;

interface

uses
  Classes, SysUtils, DBXJSON, StrUtils, Math, uTypes;

function ParseJson(const JsonStr: string): TJSONObject;
function GetStr(Obj: TJSONObject; const PairName: string; const Default: string = ''): string;
function GetInt(Obj: TJSONObject; const PairName: string; Default: Integer = 0): Integer;
function GetDouble(Obj: TJSONObject; const PairName: string; Default: Double = 0.0): Double;
function GetBool(Obj: TJSONObject; const PairName: string; Default: Boolean = False): Boolean;
function GetStringArray(Obj: TJSONObject; const PairName: string): TStringList;
function GetIntArray(Obj: TJSONObject; const PairName: string): TIntArray;
function GetDoubleArray(Obj: TJSONObject; const PairName: string): TDoubleArray;
function Get2DDoubleArray(Obj: TJSONObject; const PairName: string): T2DDoubleArray;
function GetJsonValueStr(Obj: TJSONObject; const PairName: string; const Default: string = ''): string;

procedure GetHolisticEvaluations(
  Obj: TJSONObject;
  Alt1, Alt2, Relation: TStringList;
  var FictValue: TDoubleArray
);

procedure GetDecompositionPreferences(
  Obj: TJSONObject;
  CritA, CritB, Relation: TStringList;
  var Ratio: TDoubleArray
);

function EscapeJson(const S: string): string;
function IntArrayToJson(const Arr: TIntArray): string;
function DoubleArrayToJson(const Arr: TDoubleArray): string;
function StringListToJson(const List: TStringList): string;
function T2DDoubleArrayToJson(const Arr: T2DDoubleArray): string;
function T2DIntArrayToJson(const Arr: T2DIntArray): string;
function GetPairByName(Obj: TJSONObject; const Name: string): TJSONPair;

implementation

function GetPairByName(Obj: TJSONObject; const Name: string): TJSONPair;
var
  i: Integer;
begin
  Result := nil;
  if Obj = nil then Exit;
  for i := 0 to Obj.Size - 1 do
  begin
    if Obj.Get(i).JsonString.Value = Name then
    begin
      Result := Obj.Get(i);
      Exit;
    end;
  end;
end;

function StripJsonWhitespace(const JsonStr: string): string;
var
  i, j, L: Integer;
  InString: Boolean;
  C: Char;
begin
  L := Length(JsonStr);
  SetLength(Result, L);
  InString := False;
  j := 0;
  for i := 1 to L do
  begin
    C := JsonStr[i];
    if C = '"' then
    begin
      if InString and (i > 1) and (JsonStr[i - 1] = '\') then
      begin
        // Escaped quote
      end
      else
        InString := not InString;
    end;
    
    if InString then
    begin
      Inc(j);
      Result[j] := C;
    end
    else
    begin
      if (C <> ' ') and (C <> #9) and (C <> #10) and (C <> #13) then
      begin
        Inc(j);
        Result[j] := C;
      end;
    end;
  end;
  SetLength(Result, j);
end;

function ParseJson(const JsonStr: string): TJSONObject;
var
  Val: TJSONValue;
  Bytes: TBytes;
  CleanStr: string;
begin
  Result := nil;
  if JsonStr = '' then
    Exit;
    
  CleanStr := StripJsonWhitespace(JsonStr);
  
  try
    Bytes := TEncoding.UTF8.GetBytes(CleanStr);
    Val := TJSONObject.ParseJSONValue(Bytes, 0);
    if Val is TJSONObject then
    begin
      Result := TJSONObject(Val);
      Exit;
    end;
    if Val <> nil then Val.Free;
  except
    // ignore
  end;

  try
    Bytes := TEncoding.Unicode.GetBytes(CleanStr);
    Val := TJSONObject.ParseJSONValue(Bytes, 0);
    if Val is TJSONObject then
      Result := TJSONObject(Val)
    else if Val <> nil then
      Val.Free;
  except
    // ignore
  end;
end;

function GetStr(Obj: TJSONObject; const PairName: string; const Default: string = ''): string;
var
  Pair: TJSONPair;
begin
  Result := Default;
  if Obj = nil then Exit;
  Pair := GetPairByName(Obj, PairName);
  if Pair <> nil then
    Result := Pair.JsonValue.Value;
end;

function GetJsonValueStr(Obj: TJSONObject; const PairName: string; const Default: string = ''): string;
var
  Pair: TJSONPair;
begin
  Result := Default;
  if Obj = nil then Exit;
  Pair := GetPairByName(Obj, PairName);
  if (Pair <> nil) and (Pair.JsonValue <> nil) then
    Result := Pair.JsonValue.ToString;
end;

// Added for Delphi 2010 compatibility
function GetInt(Obj: TJSONObject; const PairName: string; Default: Integer = 0): Integer;
var
  Pair: TJSONPair;
begin
  Result := Default;
  if Obj = nil then Exit;
  Pair := GetPairByName(Obj, PairName);
  if Pair <> nil then
    Result := StrToIntDef(Pair.JsonValue.Value, Default);
end;

function GetDouble(Obj: TJSONObject; const PairName: string; Default: Double = 0.0): Double;
var
  Pair: TJSONPair;
  fs: TFormatSettings;
  ValStr: string;
begin
  Result := Default;
  if Obj = nil then Exit;
  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs);
  fs.DecimalSeparator := '.';
  Pair := GetPairByName(Obj, PairName);
  if Pair <> nil then
  begin
    ValStr := StringReplace(Pair.JsonValue.Value, ',', '.', [rfReplaceAll]);
    Result := StrToFloatDef(ValStr, Default, fs);
  end;
end;

function GetBool(Obj: TJSONObject; const PairName: string; Default: Boolean = False): Boolean;
var
  Pair: TJSONPair;
begin
  Result := Default;
  if Obj = nil then Exit;
  Pair := GetPairByName(Obj, PairName);
  if Pair <> nil then
    Result := SameText(Pair.JsonValue.Value, 'true');
end;

function GetStringArray(Obj: TJSONObject; const PairName: string): TStringList;
var
  Pair: TJSONPair;
  Arr: TJSONArray;
  i: Integer;
begin
  Result := TStringList.Create;
  if Obj = nil then Exit;
  Pair := GetPairByName(Obj, PairName);
  if (Pair <> nil) and (Pair.JsonValue is TJSONArray) then
  begin
    Arr := TJSONArray(Pair.JsonValue);
    for i := 0 to Arr.Size - 1 do
      Result.Add(Arr.Get(i).Value);
  end;
end;

function GetIntArray(Obj: TJSONObject; const PairName: string): TIntArray;
var
  Pair: TJSONPair;
  Arr: TJSONArray;
  i: Integer;
  Val: TJSONValue;
begin
  SetLength(Result, 0);
  if Obj = nil then Exit;
  Pair := GetPairByName(Obj, PairName);
  if (Pair <> nil) and (Pair.JsonValue is TJSONArray) then
  begin
    Arr := TJSONArray(Pair.JsonValue);
    SetLength(Result, Arr.Size);
    for i := 0 to Arr.Size - 1 do
    begin
      Val := Arr.Get(i);
      if (Val = nil) or (Val is TJSONNull) or (Val.Value = 'null') then
        Result[i] := -1
      else
        Result[i] := StrToIntDef(Val.Value, -1);
    end;
  end;
end;

function GetDoubleArray(Obj: TJSONObject; const PairName: string): TDoubleArray;
var
  Pair: TJSONPair;
  Arr: TJSONArray;
  i: Integer;
  fs: TFormatSettings;
  ValStr: string;
begin
  SetLength(Result, 0);
  if Obj = nil then Exit;
  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs);
  fs.DecimalSeparator := '.';
  Pair := GetPairByName(Obj, PairName);
  if (Pair <> nil) and (Pair.JsonValue is TJSONArray) then
  begin
    Arr := TJSONArray(Pair.JsonValue);
    SetLength(Result, Arr.Size);
    for i := 0 to Arr.Size - 1 do
    begin
      ValStr := StringReplace(Arr.Get(i).Value, ',', '.', [rfReplaceAll]);
      Result[i] := StrToFloatDef(ValStr, 0.0, fs);
    end;
  end;
end;

function Get2DDoubleArray(Obj: TJSONObject; const PairName: string): T2DDoubleArray;
var
  Pair: TJSONPair;
  Arr, SubArr: TJSONArray;
  i, j: Integer;
  fs: TFormatSettings;
  ValStr: string;
begin
  SetLength(Result, 0);
  if Obj = nil then Exit;
  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs);
  fs.DecimalSeparator := '.';
  Pair := GetPairByName(Obj, PairName);
  if (Pair <> nil) and (Pair.JsonValue is TJSONArray) then
  begin
    Arr := TJSONArray(Pair.JsonValue);
    SetLength(Result, Arr.Size);
    for i := 0 to Arr.Size - 1 do
    begin
      if Arr.Get(i) is TJSONArray then
      begin
        SubArr := TJSONArray(Arr.Get(i));
        SetLength(Result[i], SubArr.Size);
        for j := 0 to SubArr.Size - 1 do
        begin
          ValStr := StringReplace(SubArr.Get(j).Value, ',', '.', [rfReplaceAll]);
          Result[i][j] := StrToFloatDef(ValStr, 0.0, fs);
        end;
      end;
    end;
  end;
end;

procedure GetHolisticEvaluations(
  Obj: TJSONObject;
  Alt1, Alt2, Relation: TStringList;
  var FictValue: TDoubleArray
);
var
  Pair: TJSONPair;
  Arr: TJSONArray;
  i: Integer;
  SubObj: TJSONObject;
  fs: TFormatSettings;
  ValStr: string;
begin
  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs);
  fs.DecimalSeparator := '.';
  Alt1.Clear;
  Alt2.Clear;
  Relation.Clear;
  SetLength(FictValue, 0);
  if Obj = nil then Exit;

  Pair := GetPairByName(Obj, 'holisticEvaluations');
  if (Pair <> nil) and (Pair.JsonValue is TJSONArray) then
  begin
    Arr := TJSONArray(Pair.JsonValue);
    SetLength(FictValue, Arr.Size);
    for i := 0 to Arr.Size - 1 do
    begin
      if Arr.Get(i) is TJSONObject then
      begin
        SubObj := TJSONObject(Arr.Get(i));
        Alt1.Add(GetStr(SubObj, 'alt1'));
        Alt2.Add(GetStr(SubObj, 'alt2'));
        Relation.Add(GetStr(SubObj, 'relation'));
        
        Pair := GetPairByName(SubObj, 'fictitiousValue');
        if (Pair <> nil) and not (Pair.JsonValue is TJSONNull) then
        begin
          ValStr := Pair.JsonValue.Value;
          ValStr := StringReplace(ValStr, ',', '.', [rfReplaceAll]);
          FictValue[i] := StrToFloatDef(ValStr, 0.0, fs);
        end
        else
          FictValue[i] := -1.0;
      end
      else
        FictValue[i] := -1.0;
    end;
  end;
end;

procedure GetDecompositionPreferences(
  Obj: TJSONObject;
  CritA, CritB, Relation: TStringList;
  var Ratio: TDoubleArray
);
var
  Pair: TJSONPair;
  Arr: TJSONArray;
  i: Integer;
  SubObj: TJSONObject;
  fs: TFormatSettings;
  ValStr: string;
begin
  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs);
  fs.DecimalSeparator := '.';
  CritA.Clear;
  CritB.Clear;
  Relation.Clear;
  SetLength(Ratio, 0);
  if Obj = nil then Exit;

  Pair := GetPairByName(Obj, 'decompositionPreferences');
  if (Pair <> nil) and (Pair.JsonValue is TJSONArray) then
  begin
    Arr := TJSONArray(Pair.JsonValue);
    SetLength(Ratio, Arr.Size);
    for i := 0 to Arr.Size - 1 do
    begin
      if Arr.Get(i) is TJSONObject then
      begin
        SubObj := TJSONObject(Arr.Get(i));
        CritA.Add(GetStr(SubObj, 'critA'));
        CritB.Add(GetStr(SubObj, 'critB'));
        Relation.Add(GetStr(SubObj, 'relation'));
        
        Pair := GetPairByName(SubObj, 'ratio');
        if (Pair <> nil) and not (Pair.JsonValue is TJSONNull) then
        begin
          ValStr := Pair.JsonValue.Value;
          ValStr := StringReplace(ValStr, ',', '.', [rfReplaceAll]);
          Ratio[i] := StrToFloatDef(ValStr, 0.0, fs);
        end
        else
          Ratio[i] := 0.0;
      end
      else
        Ratio[i] := 0.0;
    end;
  end;
end;

function EscapeJson(const S: string): string;
begin
  Result := S;
  Result := StringReplace(Result, '\', '\\', [rfReplaceAll]);
  Result := StringReplace(Result, '"', '\"', [rfReplaceAll]);
  Result := StringReplace(Result, #13, '\r', [rfReplaceAll]);
  Result := StringReplace(Result, #10, '\n', [rfReplaceAll]);
end;

function IntArrayToJson(const Arr: TIntArray): string;
var
  i: Integer;
begin
  Result := '[';
  for i := 0 to Length(Arr) - 1 do
  begin
    if i > 0 then Result := Result + ',';
    Result := Result + IntToStr(Arr[i]);
  end;
  Result := Result + ']';
end;

function DoubleArrayToJson(const Arr: TDoubleArray): string;
var
  i: Integer;
  fs: TFormatSettings;
begin
  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs);
  fs.DecimalSeparator := '.';
  Result := '[';
  for i := 0 to Length(Arr) - 1 do
  begin
    if i > 0 then Result := Result + ',';
    if IsNaN(Arr[i]) or IsInfinite(Arr[i]) then
      Result := Result + 'null'
    else
      Result := Result + FloatToStr(Arr[i], fs);
  end;
  Result := Result + ']';
end;

function StringListToJson(const List: TStringList): string;
var
  i: Integer;
begin
  Result := '[';
  for i := 0 to List.Count - 1 do
  begin
    if i > 0 then Result := Result + ',';
    Result := Result + '"' + EscapeJson(List[i]) + '"';
  end;
  Result := Result + ']';
end;

function T2DDoubleArrayToJson(const Arr: T2DDoubleArray): string;
var
  i: Integer;
begin
  Result := '[';
  for i := 0 to Length(Arr) - 1 do
  begin
    if i > 0 then Result := Result + ',';
    Result := Result + DoubleArrayToJson(Arr[i]);
  end;
  Result := Result + ']';
end;

function T2DIntArrayToJson(const Arr: T2DIntArray): string;
var
  i: Integer;
begin
  Result := '[';
  for i := 0 to Length(Arr) - 1 do
  begin
    if i > 0 then Result := Result + ',';
    Result := Result + IntArrayToJson(Arr[i]);
  end;
  Result := Result + ']';
end;

end.
