unit uElicitation;

interface

uses
  Classes, SysUtils, Math, uTypes, uPermutations;

type
  TElicitationResult = record
    AltX: Integer;
    AltZ: Integer;
    MatrizProbX: T2DDoubleArray;
    MatrizProbZ: T2DDoubleArray;
    MatrizProbOutros: T2DDoubleArray;
  end;

  TDecompositionQuestion = record
    CritAIdx: Integer;
    CritBIdx: Integer;
    Ratio: Double;
  end;

function AnaliseParaElicitacao(
  const CasesOrdemCrit: T2DIntArray;
  const MatrizPoa: T2DIntArray;
  const ResultSol: TIntArray;
  const MatrizSol: T2DIntArray
): TElicitationResult;

function SearchNextDecompositionQuestion(
  const WeightsMatrix: T2DDoubleArray;
  const ActiveValidMask: array of Boolean;
  NumCrit: Integer;
  const MatrizPoa: T2DIntArray;
  const ExcludedA: TIntArray;
  const ExcludedB: TIntArray
): Boolean;

var
  NextQuestionResult: TDecompositionQuestion;

implementation

function AnaliseParaElicitacao(
  const CasesOrdemCrit: T2DIntArray;
  const MatrizPoa: T2DIntArray;
  const ResultSol: TIntArray;
  const MatrizSol: T2DIntArray
): TElicitationResult;
var
  NumCases, NumCrit, NumAlt: Integer;
  AltFreq: TDoubleArray;
  i, j, c1, c2, idx: Integer;
  OrdemAlt: TIntArray;
  Temp: Integer;
  CasesC1GtC2: Integer;
  XWins, ZWins: Integer;
  ValidCases: Integer;
begin
  NumCases := Length(CasesOrdemCrit);
  if NumCases = 0 then
    Exit;
  NumCrit := Length(CasesOrdemCrit[0]);
  NumAlt := Length(MatrizPoa[0]);
  ValidCases := NumCases - 1;
  Writeln('  TRACE ELIC 1: NumCases = ', NumCases, ', NumCrit = ', NumCrit, ', NumAlt = ', NumAlt);
  Flush(Output);

  SetLength(Result.MatrizProbX, NumCrit, NumCrit);
  SetLength(Result.MatrizProbZ, NumCrit, NumCrit);
  SetLength(Result.MatrizProbOutros, NumCrit, NumCrit);

  for c1 := 0 to NumCrit - 1 do
    for c2 := 0 to NumCrit - 1 do
    begin
      Result.MatrizProbX[c1][c2] := 0.0;
      Result.MatrizProbZ[c1][c2] := 0.0;
      Result.MatrizProbOutros[c1][c2] := 0.0;
    end;

  SetLength(AltFreq, NumAlt);
  for j := 0 to NumAlt - 1 do
  begin
    AltFreq[j] := 0.0;
    for i := 0 to ValidCases - 1 do
    begin
      if MatrizPoa[i][j] = 1 then
        AltFreq[j] := AltFreq[j] + 1.0;
    end;
  end;

  SetLength(OrdemAlt, NumAlt);
  for j := 0 to NumAlt - 1 do
    OrdemAlt[j] := j;

  for i := 0 to NumAlt - 2 do
  begin
    for j := i + 1 to NumAlt - 1 do
    begin
      if AltFreq[OrdemAlt[i]] < AltFreq[OrdemAlt[j]] then
      begin
        Temp := OrdemAlt[i];
        OrdemAlt[i] := OrdemAlt[j];
        OrdemAlt[j] := Temp;
      end;
    end;
  end;

  if NumAlt >= 2 then
  begin
    Result.AltX := OrdemAlt[0];
    Result.AltZ := OrdemAlt[1];
  end
  else if NumAlt = 1 then
  begin
    Result.AltX := OrdemAlt[0];
    Result.AltZ := -1;
  end
  else
  begin
    Result.AltX := -1;
    Result.AltZ := -1;
  end;
  Writeln('  TRACE ELIC 2: AltX = ', Result.AltX, ', AltZ = ', Result.AltZ);
  Flush(Output);

  for c1 := 0 to NumCrit - 1 do
  begin
    for c2 := 0 to NumCrit - 1 do
    begin
      if c1 = c2 then
        Continue;

      CasesC1GtC2 := 0;
      XWins := 0;
      ZWins := 0;

      for i := 0 to ValidCases - 1 do
      begin
        if CasesOrdemCrit[i][c1] < CasesOrdemCrit[i][c2] then
        begin
          Inc(CasesC1GtC2);
          if (Result.AltX <> -1) and (MatrizPoa[i][Result.AltX] = 1) then
            Inc(XWins);
          if (Result.AltZ <> -1) and (MatrizPoa[i][Result.AltZ] = 1) then
            Inc(ZWins);
        end;
      end;

      if CasesC1GtC2 > 0 then
      begin
        Result.MatrizProbX[c1][c2] := XWins / CasesC1GtC2;
        Result.MatrizProbZ[c1][c2] := ZWins / CasesC1GtC2;
        Result.MatrizProbOutros[c1][c2] := 1.0 - Result.MatrizProbX[c1][c2] - Result.MatrizProbZ[c1][c2];
        if Result.MatrizProbOutros[c1][c2] < 0.0 then
          Result.MatrizProbOutros[c1][c2] := 0.0;
      end;
    end;
  end;
  Writeln('  TRACE ELIC 3: Finished c1 c2 loop');
  Flush(Output);
end;

procedure QuickSort(var Arr: TDoubleArray; L, R: Integer);
var
  i, j: Integer;
  Pivot, Temp: Double;
begin
  i := L;
  j := R;
  Pivot := Arr[(L + R) div 2];
  repeat
    while Arr[i] < Pivot do i := i + 1;
    while Arr[j] > Pivot do j := j - 1;
    if i <= j then
    begin
      Temp := Arr[i];
      Arr[i] := Arr[j];
      Arr[j] := Temp;
      i := i + 1;
      j := j - 1;
    end;
  until i > j;
  if L < j then QuickSort(Arr, L, j);
  if i < R then QuickSort(Arr, i, R);
end;

function GetMedian(const Arr: TDoubleArray): Double;
var
  Len: Integer;
  SortedArr: TDoubleArray;
  i: Integer;
begin
  Len := Length(Arr);
  if Len = 0 then
  begin
    Result := 0.0;
    Exit;
  end;
  SetLength(SortedArr, Len);
  for i := 0 to Len - 1 do
    SortedArr[i] := Arr[i];

  QuickSort(SortedArr, 0, Len - 1);
  if Len mod 2 = 1 then
    Result := SortedArr[Len div 2]
  else
    Result := (SortedArr[(Len div 2) - 1] + SortedArr[Len div 2]) / 2.0;
end;

function IsExcluded(a, b: Integer; const ExcludedA, ExcludedB: TIntArray): Boolean;
var
  i: Integer;
begin
  Result := False;
  for i := 0 to Length(ExcludedA) - 1 do
  begin
    if ((ExcludedA[i] = a) and (ExcludedB[i] = b)) or
       ((ExcludedA[i] = b) and (ExcludedB[i] = a)) then
    begin
      Result := True;
      Break;
    end;
  end;
end;

function SearchNextDecompositionQuestion(
  const WeightsMatrix: T2DDoubleArray;
  const ActiveValidMask: array of Boolean;
  NumCrit: Integer;
  const MatrizPoa: T2DIntArray;
  const ExcludedA: TIntArray;
  const ExcludedB: TIntArray
): Boolean;
var
  NumCases, NumAlt: Integer;
  a, b, i, idx, k, j, rIdx: Integer;
  ValidPermIndices: TIntArray;
  Ratios: TDoubleArray;
  Y: Double;
  Indices1, Indices2: TIntArray;
  Probs1, Probs2: TDoubleArray;
  P1, P2, Score: Double;
  SplitDiff: Integer;
  BestScore: Double;
  BestSplitDiff: Integer;
  BestPairA, BestPairB: Integer;
  BestRatio: Double;
  Found, AlreadyExists: Boolean;
  Soma, RVal: Double;
begin
  NumCases := Length(WeightsMatrix);
  NumAlt := Length(MatrizPoa[0]);

  BestScore := -1.0;
  BestSplitDiff := 9999999;
  BestPairA := -1;
  BestPairB := -1;
  BestRatio := 0.0;
  Found := False;

  SetLength(ValidPermIndices, 0);
  for i := 0 to NumCases - 2 do
  begin
    if ActiveValidMask[i] then
    begin
      idx := Length(ValidPermIndices);
      SetLength(ValidPermIndices, idx + 1);
      ValidPermIndices[idx] := i;
    end;
  end;

  if Length(ValidPermIndices) > 0 then
  begin
    for a := 0 to NumCrit - 1 do
    begin
      for b := 0 to NumCrit - 1 do
      begin
        if a = b then Continue;
        if IsExcluded(a, b, ExcludedA, ExcludedB) then Continue;

        SetLength(Ratios, 0);
        for i := 0 to Length(ValidPermIndices) - 1 do
        begin
          idx := ValidPermIndices[i];
          if (WeightsMatrix[idx][a] > 0) and (WeightsMatrix[idx][b] <= WeightsMatrix[idx][a] + 1e-9) then
          begin
            RVal := WeightsMatrix[idx][b] / WeightsMatrix[idx][a];
            AlreadyExists := False;
            for k := 0 to Length(Ratios) - 1 do
            begin
              if Abs(Ratios[k] - RVal) <= 1e-9 then
              begin
                AlreadyExists := True;
                Break;
              end;
            end;
            if not AlreadyExists then
            begin
              k := Length(Ratios);
              SetLength(Ratios, k + 1);
              Ratios[k] := RVal;
            end;
          end;
        end;

        if Length(Ratios) = 0 then Continue;

        for rIdx := 0 to Length(Ratios) - 1 do
        begin
          Y := Ratios[rIdx];
          if Y > 1.0 + 1e-9 then Continue;

          SetLength(Indices1, 0);
          SetLength(Indices2, 0);
          for i := 0 to Length(ValidPermIndices) - 1 do
          begin
            idx := ValidPermIndices[i];
            if WeightsMatrix[idx][b] > Y * WeightsMatrix[idx][a] + 1e-9 then
            begin
              k := Length(Indices1);
              SetLength(Indices1, k + 1);
              Indices1[k] := idx;
            end;
            if WeightsMatrix[idx][b] <= Y * WeightsMatrix[idx][a] + 1e-9 then
            begin
              k := Length(Indices2);
              SetLength(Indices2, k + 1);
              Indices2[k] := idx;
            end;
          end;

          if (Length(Indices1) = 0) or (Length(Indices2) = 0) then Continue;

          SetLength(Probs1, NumAlt);
          for j := 0 to NumAlt - 1 do
          begin
            Soma := 0.0;
            for i := 0 to Length(Indices1) - 1 do
              Soma := Soma + MatrizPoa[Indices1[i]][j];
            Probs1[j] := Soma / Length(Indices1);
          end;
          P1 := Probs1[0];
          for j := 1 to NumAlt - 1 do
            if Probs1[j] > P1 then P1 := Probs1[j];

          SetLength(Probs2, NumAlt);
          for j := 0 to NumAlt - 1 do
          begin
            Soma := 0.0;
            for i := 0 to Length(Indices2) - 1 do
              Soma := Soma + MatrizPoa[Indices2[i]][j];
            Probs2[j] := Soma / Length(Indices2);
          end;
          P2 := Probs2[0];
          for j := 1 to NumAlt - 1 do
            if Probs2[j] > P2 then P2 := Probs2[j];

          Score := Min(P1, P2);
          SplitDiff := Abs(Length(Indices1) - Length(Indices2));

          if Score > BestScore then
          begin
            BestScore := Score;
            BestPairA := a;
            BestPairB := b;
            BestRatio := Y;
            BestSplitDiff := SplitDiff;
            Found := True;
          end
          else if Abs(Score - BestScore) <= 1e-9 then
          begin
            if SplitDiff < BestSplitDiff then
            begin
              BestPairA := a;
              BestPairB := b;
              BestRatio := Y;
              BestSplitDiff := SplitDiff;
              Found := True;
            end;
          end;
        end;
      end;
    end;
  end;

  if Found then
  begin
    NextQuestionResult.CritAIdx := BestPairA;
    NextQuestionResult.CritBIdx := BestPairB;
    NextQuestionResult.Ratio := BestRatio;
    Result := True;
  end
  else
    Result := False;
end;

end.
