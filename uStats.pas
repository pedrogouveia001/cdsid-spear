unit uStats;

interface

uses
  Classes, SysUtils, Math, uTypes, uPermutations, uNormalization;

type
  TStatsResult = record
    MediaDifSol: T2DDoubleArray;
    MaxDifSol: T2DDoubleArray;
    MinDifSol: T2DDoubleArray;
    MediaGeral: TDoubleArray;
    MaximoGeral: TDoubleArray;
    MinimoGeral: TDoubleArray;
    MediaGeralNaoSol: TDoubleArray;
    MaximoGeralNaoSol: TDoubleArray;
    MinimoGeralNaoSol: TDoubleArray;
    DesvioPadraoDifSol: T2DDoubleArray;
    DesvioPadraoGeral: TDoubleArray;
  end;

function ComputeStatistics(
  const MatrizSol: T2DIntArray;
  const ResultSol: TIntArray;
  const CaseSol: TIntArray;
  const MatrizDifVg: T2DDoubleArray
): TStatsResult;

implementation

function ComputeStatistics(
  const MatrizSol: T2DIntArray;
  const ResultSol: TIntArray;
  const CaseSol: TIntArray;
  const MatrizDifVg: T2DDoubleArray
): TStatsResult;
var
  NumSols, NumAlt, NumCases, NumValidCases: Integer;
  i, j, k, t, idx: Integer;
  WinCases: array of Integer;
  LossCases: array of Integer;
  NumWin, NumLoss: Integer;
  JAlts: array of Integer;
  NumJAlts: Integer;
  IAlts: array of Integer;
  NumIAlts: Integer;
  LVal, SumVal, MaxVal, MinVal: Double;
  ValidJs: TIntArray;
  NumValidJs: Integer;
  MeanVal, Variance, Diff: Double;
  AllLosses: TDoubleArray;
  AllLossesCount: Integer;
begin
  NumSols := Length(MatrizSol);
  if NumSols = 0 then
    Exit;
  NumAlt := Length(MatrizSol[0]);
  NumCases := Length(MatrizDifVg);
  NumValidCases := NumCases - 1; // Exclude the last equal weights case
  Writeln('TRACE STATS 1: NumSols = ', NumSols, ', NumCases = ', NumCases, ', NumValidCases = ', NumValidCases, ', Length(CaseSol) = ', Length(CaseSol));
  for i := 0 to NumSols - 1 do
    Writeln('  MatrizSol[', i, '] length = ', Length(MatrizSol[i]));
  
  idx := -1;
  for k := 0 to Length(CaseSol) - 1 do
  begin
    if CaseSol[k] > idx then
      idx := CaseSol[k];
  end;
  Writeln('  CaseSol max value = ', idx);

  SetLength(Result.MediaDifSol, NumSols, NumSols);
  SetLength(Result.MaxDifSol, NumSols, NumSols);
  SetLength(Result.MinDifSol, NumSols, NumSols);
  SetLength(Result.MediaGeral, NumSols);
  SetLength(Result.MaximoGeral, NumSols);
  SetLength(Result.MinimoGeral, NumSols);
  SetLength(Result.MediaGeralNaoSol, NumSols);
  SetLength(Result.MaximoGeralNaoSol, NumSols);
  SetLength(Result.MinimoGeralNaoSol, NumSols);
  SetLength(Result.DesvioPadraoDifSol, NumSols, NumSols);
  SetLength(Result.DesvioPadraoGeral, NumSols);

  for i := 0 to NumSols - 1 do
  begin
    for j := 0 to NumSols - 1 do
    begin
      Result.MediaDifSol[i][j] := 0.0;
      Result.MaxDifSol[i][j] := 0.0;
      Result.MinDifSol[i][j] := 0.0;
      Result.DesvioPadraoDifSol[i][j] := 0.0;
    end;
    Result.MediaGeral[i] := 0.0;
    Result.MaximoGeral[i] := 0.0;
    Result.MinimoGeral[i] := 0.0;
    Result.MediaGeralNaoSol[i] := 0.0;
    Result.MaximoGeralNaoSol[i] := 0.0;
    Result.MinimoGeralNaoSol[i] := 0.0;
    Result.DesvioPadraoGeral[i] := 0.0;
  end;
  Writeln('TRACE STATS 2: Allocated Result records');

  for i := 0 to NumSols - 1 do
  begin
    SetLength(WinCases, 0);
    SetLength(LossCases, 0);
    for k := 0 to NumValidCases - 1 do
    begin
      if CaseSol[k] = i + 1 then
      begin
        idx := Length(WinCases);
        SetLength(WinCases, idx + 1);
        WinCases[idx] := k;
      end
      else
      begin
        idx := Length(LossCases);
        SetLength(LossCases, idx + 1);
        LossCases[idx] := k;
      end;
    end;

    NumWin := Length(WinCases);
    NumLoss := Length(LossCases);
    Writeln('TRACE STATS 3: Loop i = ', i, ', NumWin = ', NumWin, ', NumLoss = ', NumLoss);

    for j := 0 to NumSols - 1 do
    begin
      if i = j then
        Continue;

      SetLength(JAlts, 0);
      for t := 0 to NumAlt - 1 do
      begin
        if MatrizSol[j][t] = 1 then
        begin
          idx := Length(JAlts);
          SetLength(JAlts, idx + 1);
          JAlts[idx] := t;
        end;
      end;
      NumJAlts := Length(JAlts);
      Writeln('TRACE STATS 4: Loop j = ', j, ', NumJAlts = ', NumJAlts);

      if (NumJAlts = 0) or (NumWin = 0) then
        Continue;

      SumVal := 0.0;
      MaxVal := -1.0;
      MinVal := 1e30;

      for k := 0 to NumWin - 1 do
      begin
        for t := 0 to NumJAlts - 1 do
        begin
          LVal := MatrizDifVg[WinCases[k]][JAlts[t]];
          SumVal := SumVal + LVal;
          if LVal > MaxVal then
            MaxVal := LVal;
          if LVal < MinVal then
            MinVal := LVal;
        end;
      end;

      Result.MediaDifSol[i][j] := SumVal / (NumJAlts * NumWin);
      Result.MaxDifSol[i][j] := MaxVal;
      Result.MinDifSol[i][j] := MinVal;
    end;

    SetLength(ValidJs, 0);
    for j := 0 to NumSols - 1 do
    begin
      NumJAlts := 0;
      for t := 0 to NumAlt - 1 do
        if MatrizSol[j][t] = 1 then
          Inc(NumJAlts);

      if (j <> i) and (NumJAlts > 0) and (NumWin > 0) then
      begin
        idx := Length(ValidJs);
        SetLength(ValidJs, idx + 1);
        ValidJs[idx] := j;
      end;
    end;
    NumValidJs := Length(ValidJs);

    if NumValidJs > 0 then
    begin
      SumVal := 0.0;
      MaxVal := Result.MaxDifSol[i][ValidJs[0]];
      MinVal := Result.MinDifSol[i][ValidJs[0]];
      for j := 0 to NumValidJs - 1 do
      begin
        SumVal := SumVal + Result.MediaDifSol[i][ValidJs[j]];
        if Result.MaxDifSol[i][ValidJs[j]] > MaxVal then
          MaxVal := Result.MaxDifSol[i][ValidJs[j]];
        if Result.MinDifSol[i][ValidJs[j]] < MinVal then
          MinVal := Result.MinDifSol[i][ValidJs[j]];
      end;
      Result.MediaGeral[i] := SumVal / NumValidJs;
      Result.MaximoGeral[i] := MaxVal;
      Result.MinimoGeral[i] := MinVal;
    end;

    SetLength(IAlts, 0);
    for t := 0 to NumAlt - 1 do
    begin
      if MatrizSol[i][t] = 1 then
      begin
        idx := Length(IAlts);
        SetLength(IAlts, idx + 1);
        IAlts[idx] := t;
      end;
    end;
    NumIAlts := Length(IAlts);

    if (NumIAlts > 0) and (NumLoss > 0) then
    begin
      SumVal := 0.0;
      MaxVal := -1.0;
      MinVal := 1e30;
      for k := 0 to NumLoss - 1 do
      begin
        for t := 0 to NumIAlts - 1 do
        begin
          LVal := MatrizDifVg[LossCases[k]][IAlts[t]];
          SumVal := SumVal + LVal;
          if LVal > MaxVal then
            MaxVal := LVal;
          if LVal < MinVal then
            MinVal := LVal;
        end;
      end;
      Result.MediaGeralNaoSol[i] := SumVal / (NumIAlts * NumLoss);
      Result.MaximoGeralNaoSol[i] := MaxVal;
      Result.MinimoGeralNaoSol[i] := MinVal;
    end;
    Writeln('TRACE STATS 5: Loop i = ', i, ' completed');
  end;

  for i := 0 to NumSols - 1 do
  begin
    SetLength(WinCases, 0);
    for k := 0 to NumValidCases - 1 do
    begin
      if CaseSol[k] = i + 1 then
      begin
        idx := Length(WinCases);
        SetLength(WinCases, idx + 1);
        WinCases[idx] := k;
      end;
    end;
    NumWin := Length(WinCases);
    if NumWin = 0 then
      Continue;

    for j := 0 to NumSols - 1 do
    begin
      if i = j then
        Continue;

      SetLength(JAlts, 0);
      for t := 0 to NumAlt - 1 do
        if MatrizSol[j][t] = 1 then
        begin
          idx := Length(JAlts);
          SetLength(JAlts, idx + 1);
          JAlts[idx] := t;
        end;
      NumJAlts := Length(JAlts);

      if NumJAlts = 0 then
        Continue;

      Writeln('TRACE SD DEBUG: i = ', i, ', j = ', j, ', NumJAlts = ', NumJAlts, ', NumWin = ', NumWin);
      Flush(Output);
      MeanVal := Result.MediaDifSol[i][j];
      Variance := 0.0;
      for k := 0 to NumWin - 1 do
      begin
        for t := 0 to NumJAlts - 1 do
        begin
          Diff := MatrizDifVg[WinCases[k]][JAlts[t]] - MeanVal;
          Variance := Variance + Diff * Diff;
        end;
      end;
      Result.DesvioPadraoDifSol[i][j] := Sqrt(Variance / (NumJAlts * NumWin));
    end;

    SetLength(ValidJs, 0);
    for j := 0 to NumSols - 1 do
    begin
      NumJAlts := 0;
      for t := 0 to NumAlt - 1 do
        if MatrizSol[j][t] = 1 then
          Inc(NumJAlts);
      if (j <> i) and (NumJAlts > 0) then
      begin
        idx := Length(ValidJs);
        SetLength(ValidJs, idx + 1);
        ValidJs[idx] := j;
      end;
    end;
    NumValidJs := Length(ValidJs);

    if NumValidJs > 0 then
    begin
      SetLength(AllLosses, 0);
      AllLossesCount := 0;
      for j := 0 to NumValidJs - 1 do
      begin
        SetLength(JAlts, 0);
        for t := 0 to NumAlt - 1 do
          if MatrizSol[ValidJs[j]][t] = 1 then
          begin
            idx := Length(JAlts);
            SetLength(JAlts, idx + 1);
            JAlts[idx] := t;
          end;
        NumJAlts := Length(JAlts);
        if NumJAlts > 0 then
        begin
          idx := Length(AllLosses);
          SetLength(AllLosses, idx + NumWin * NumJAlts);
          for k := 0 to NumWin - 1 do
          begin
            for t := 0 to NumJAlts - 1 do
            begin
              AllLosses[AllLossesCount] := MatrizDifVg[WinCases[k]][JAlts[t]];
              Inc(AllLossesCount);
            end;
          end;
        end;
      end;

      if AllLossesCount > 0 then
      begin
        MeanVal := Result.MediaGeral[i];
        Variance := 0.0;
        for k := 0 to AllLossesCount - 1 do
        begin
          Diff := AllLosses[k] - MeanVal;
          Variance := Variance + Diff * Diff;
        end;
        Result.DesvioPadraoGeral[i] := Sqrt(Variance / AllLossesCount);
      end;
    end;
  end;
  Writeln('TRACE STATS 6: Completed all stats');
end;

end.
