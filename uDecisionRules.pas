unit uDecisionRules;

interface

uses
  Classes, SysUtils, Math, uTypes, uPermutations, uStats;

type
  TDecisionRuleResult = record
    Status: string;
    RecommendedAlts: TIntArray;
    Probability: Double;
    RuleLevel: Integer;
  end;

function ApplyDecisionRules(
  const ResultSol: TIntArray;
  const MatrizSol: T2DIntArray;
  const Stats: TStatsResult;
  TotalCases: Integer
): TDecisionRuleResult;

implementation

procedure SortSolsByFrequency(const ResultSol: TIntArray; var OrdemSol: TIntArray);
var
  i, j, Temp, Len: Integer;
begin
  Len := Length(ResultSol);
  SetLength(OrdemSol, Len);
  for i := 0 to Len - 1 do
    OrdemSol[i] := i;

  for i := 0 to Len - 2 do
  begin
    for j := i + 1 to Len - 1 do
    begin
      if ResultSol[OrdemSol[i]] < ResultSol[OrdemSol[j]] then
      begin
        Temp := OrdemSol[i];
        OrdemSol[i] := OrdemSol[j];
        OrdemSol[j] := Temp;
      end;
    end;
  end;
end;

function GetAltsForSol(const MatrizSol: T2DIntArray; SolIdx: Integer): TIntArray;
var
  t, idx: Integer;
begin
  SetLength(Result, 0);
  for t := 0 to Length(MatrizSol[SolIdx]) - 1 do
  begin
    if MatrizSol[SolIdx][t] = 1 then
    begin
      idx := Length(Result);
      SetLength(Result, idx + 1);
      Result[idx] := t;
    end;
  end;
end;

procedure AddUniqueInts(var Dest: TIntArray; const Source: TIntArray);
var
  i, j: Integer;
  Found: Boolean;
  LenDest: Integer;
begin
  for i := 0 to Length(Source) - 1 do
  begin
    Found := False;
    for j := 0 to Length(Dest) - 1 do
    begin
      if Source[i] = Dest[j] then
      begin
        Found := True;
        break;
      end;
    end;
    if not Found then
    begin
      LenDest := Length(Dest);
      SetLength(Dest, LenDest + 1);
      Dest[LenDest] := Source[i];
    end;
  end;
end;

function ApplyDecisionRules(
  const ResultSol: TIntArray;
  const MatrizSol: T2DIntArray;
  const Stats: TStatsResult;
  TotalCases: Integer
): TDecisionRuleResult;
var
  NumSols: Integer;
  OrdemSol: TIntArray;
  FaixaProb: array[0..3] of Double;
  Epsilon: array[0..3] of Double;
  Omega: array[0..3] of Double;
  MediaNaoSol: TDoubleArray;
  MaxNaoSol: TDoubleArray;
  p1, p12, p123: Double;
  i: Integer;
  Alts, Alts1, Alts2, Alts3: TIntArray;
begin
  NumSols := Length(ResultSol);
  if NumSols = 0 then
  begin
    Result.Status := 'Unable to make it';
    SetLength(Result.RecommendedAlts, 0);
    Result.Probability := 0.0;
    Result.RuleLevel := -1;
    Exit;
  end;

  SortSolsByFrequency(ResultSol, OrdemSol);

  FaixaProb[0] := 0.80; FaixaProb[1] := 0.70; FaixaProb[2] := 0.60; FaixaProb[3] := 0.50;
  Epsilon[0]   := 0.50; Epsilon[1]   := 0.40; Epsilon[2]   := 0.30; Epsilon[3]   := 0.20;
  Omega[0]     := 0.25; Omega[1]     := 0.20; Omega[2]     := 0.15; Omega[3]     := 0.10;

  MediaNaoSol := Stats.MediaGeralNaoSol;
  MaxNaoSol := Stats.MaximoGeralNaoSol;

  p1 := ResultSol[OrdemSol[0]] / TotalCases;
  for i := 0 to 3 do
  begin
    if ((i = 0) and (p1 >= FaixaProb[i])) or
       ((i > 0) and (p1 < FaixaProb[i - 1]) and (p1 >= FaixaProb[i])) then
    begin
      if (MaxNaoSol[OrdemSol[0]] < Epsilon[i]) and (MediaNaoSol[OrdemSol[0]] < Omega[i]) then
      begin
        Result.Status := 'Best Alternative';
        Result.RecommendedAlts := GetAltsForSol(MatrizSol, OrdemSol[0]);
        Result.Probability := p1 * 100.0;
        Result.RuleLevel := i;
        Exit;
      end;
    end;
  end;

  if NumSols >= 2 then
  begin
    p12 := (ResultSol[OrdemSol[0]] + ResultSol[OrdemSol[1]]) / TotalCases;
    for i := 0 to 3 do
    begin
      if ((i = 0) and (p12 >= FaixaProb[i])) or
         ((i > 0) and (p12 < FaixaProb[i - 1]) and (p12 >= FaixaProb[i])) then
      begin
        if (MaxNaoSol[OrdemSol[0]] < Epsilon[i]) and (MediaNaoSol[OrdemSol[0]] < Omega[i]) and
           (MaxNaoSol[OrdemSol[1]] < Epsilon[i]) and (MediaNaoSol[OrdemSol[1]] < Omega[i]) then
        begin
          Result.Status := 'Two Alternatives are Competitive';
          SetLength(Result.RecommendedAlts, 0);
          Alts1 := GetAltsForSol(MatrizSol, OrdemSol[0]);
          Alts2 := GetAltsForSol(MatrizSol, OrdemSol[1]);
          AddUniqueInts(Result.RecommendedAlts, Alts1);
          AddUniqueInts(Result.RecommendedAlts, Alts2);
          Result.Probability := p12 * 100.0;
          Result.RuleLevel := i;
          Exit;
        end;
      end;
    end;
  end;

  if NumSols >= 3 then
  begin
    p123 := (ResultSol[OrdemSol[0]] + ResultSol[OrdemSol[1]] + ResultSol[OrdemSol[2]]) / TotalCases;
    for i := 0 to 3 do
    begin
      if ((i = 0) and (p123 >= FaixaProb[i])) or
         ((i > 0) and (p123 < FaixaProb[i - 1]) and (p123 >= FaixaProb[i])) then
      begin
        if (MaxNaoSol[OrdemSol[0]] < Epsilon[i]) and (MediaNaoSol[OrdemSol[0]] < Omega[i]) and
           (MaxNaoSol[OrdemSol[1]] < Epsilon[i]) and (MediaNaoSol[OrdemSol[1]] < Omega[i]) and
           (MaxNaoSol[OrdemSol[2]] < Epsilon[i]) and (MediaNaoSol[OrdemSol[2]] < Omega[i]) then
        begin
          Result.Status := 'Three Alternatives are Competitive';
          SetLength(Result.RecommendedAlts, 0);
          Alts1 := GetAltsForSol(MatrizSol, OrdemSol[0]);
          Alts2 := GetAltsForSol(MatrizSol, OrdemSol[1]);
          Alts3 := GetAltsForSol(MatrizSol, OrdemSol[2]);
          AddUniqueInts(Result.RecommendedAlts, Alts1);
          AddUniqueInts(Result.RecommendedAlts, Alts2);
          AddUniqueInts(Result.RecommendedAlts, Alts3);
          Result.Probability := p123 * 100.0;
          Result.RuleLevel := i;
          Exit;
        end;
      end;
    end;
  end;

  Result.Status := 'Unable to make it';
  Result.RecommendedAlts := GetAltsForSol(MatrizSol, OrdemSol[0]);
  Result.Probability := p1 * 100.0;
  Result.RuleLevel := -1;
end;

end.
