unit uPermutations;

interface

uses
  Classes, SysUtils, uTypes;

function GerarCases(NumCrit: Integer): T2DIntArray;

implementation

procedure Permute(var ResultList: T2DIntArray; var Arr: TIntArray; Left, Right: Integer);
var
  i, Temp: Integer;
  NewRow: TIntArray;
  Idx: Integer;
begin
  if Left = Right then
  begin
    Idx := Length(ResultList);
    SetLength(ResultList, Idx + 1);
    SetLength(NewRow, Length(Arr));
    for i := 0 to Length(Arr) - 1 do
      NewRow[i] := Arr[i];
    ResultList[Idx] := NewRow;
  end
  else
  begin
    for i := Left to Right do
    begin
      // Swap
      Temp := Arr[Left];
      Arr[Left] := Arr[i];
      Arr[i] := Temp;

      Permute(ResultList, Arr, Left + 1, Right);

      // Swap back
      Temp := Arr[Left];
      Arr[Left] := Arr[i];
      Arr[i] := Temp;
    end;
  end;
end;

procedure SortLexicographically(var ResultList: T2DIntArray);
var
  i, j, k, Len: Integer;
  Temp: TIntArray;
  CompareVal: Integer;
begin
  Len := Length(ResultList);
  for i := 0 to Len - 2 do
  begin
    for j := i + 1 to Len - 1 do
    begin
      CompareVal := 0;
      for k := 0 to Length(ResultList[i]) - 1 do
      begin
        if ResultList[i][k] < ResultList[j][k] then
        begin
          CompareVal := -1;
          break;
        end
        else if ResultList[i][k] > ResultList[j][k] then
        begin
          CompareVal := 1;
          break;
        end;
      end;
      if CompareVal > 0 then
      begin
        Temp := ResultList[i];
        ResultList[i] := ResultList[j];
        ResultList[j] := Temp;
      end;
    end;
  end;
end;

function GerarCases(NumCrit: Integer): T2DIntArray;
var
  Arr: TIntArray;
  i: Integer;
  ResultList: T2DIntArray;
  Idx: Integer;
begin
  SetLength(ResultList, 0);
  SetLength(Arr, NumCrit);
  for i := 0 to NumCrit - 1 do
    Arr[i] := i + 1;

  Permute(ResultList, Arr, 0, NumCrit - 1);
  SortLexicographically(ResultList);

  Idx := Length(ResultList);
  SetLength(ResultList, Idx + 1);
  SetLength(ResultList[Idx], NumCrit);
  for i := 0 to NumCrit - 1 do
    ResultList[Idx][i] := 0;

  Result := ResultList;
end;

end.
