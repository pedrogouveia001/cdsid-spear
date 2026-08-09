unit uSensitivity;

interface

uses
  Classes, SysUtils, Math, uTypes, uPermutations, uNormalization, uPromethee, uSurrogate;

type
  TSensitivityResult = record
    Alternatives: TStringList;
    Probabilities: TDoubleArray;
    Deltas: TDoubleArray;
    MinCrit: TDoubleArray;
    MaxCrit: TDoubleArray;
  end;

function RunSensitivityAnalysis(
  const MatrizConseq: T2DDoubleArray;
  const TipoCrit: TIntArray;
  const Niveis: TIntArray;
  const Rationality: string;
  const RankFilters: TIntArray;
  const HolisticAlt1: TStringList;
  const HolisticAlt2: TStringList;
  const HolisticRelation: TStringList;
  const HolisticFictValue: TDoubleArray;
  const NomesAlt: TStringList;
  const NomesCrit: TStringList;
  const VariationsPct: TDoubleArray;
  const DecompCritA: TStringList;
  const DecompCritB: TStringList;
  const DecompRelation: TStringList;
  const DecompRatio: TDoubleArray;
  NumSimulations: Integer = 10000
): TSensitivityResult;

implementation

function RunSensitivityAnalysis(
  const MatrizConseq: T2DDoubleArray;
  const TipoCrit: TIntArray;
  const Niveis: TIntArray;
  const Rationality: string;
  const RankFilters: TIntArray;
  const HolisticAlt1: TStringList;
  const HolisticAlt2: TStringList;
  const HolisticRelation: TStringList;
  const HolisticFictValue: TDoubleArray;
  const NomesAlt: TStringList;
  const NomesCrit: TStringList;
  const VariationsPct: TDoubleArray;
  const DecompCritA: TStringList;
  const DecompCritB: TStringList;
  const DecompRelation: TStringList;
  const DecompRatio: TDoubleArray;
  NumSimulations: Integer = 10000
): TSensitivityResult;
var
  NumAlt, NumCrit, NumCases: Integer;
  CasesOrdemCrit: T2DIntArray;
  i, j, k, p, c, m: Integer;
  CritIdx: Integer;
  ValidMask: array of Boolean;
  FilteredPerms: T2DIntArray;
  Len: Integer;
  MatrizConseqNormOrig: T2DDoubleArray;
  MaxCritOrig, MinCritOrig: TDoubleArray;
  ResRoc, ResProm: T2DDoubleArray;
  MatDifVg, MatDifVgProm: T2DDoubleArray;
  MatPoa, MatPoaProm: T2DIntArray;
  M1, M2: T2DIntArray;
  V1, V2, V3, V4: TIntArray;
  IsComp: Boolean;
  ActiveValidMask: array of Boolean;
  Alt1Name, Alt2Name, Relation: string;
  Idx1, Idx2: Integer;
  FictVal: Double;
  RocW: TDoubleArray;
  WeightsMatrixFilter: T2DDoubleArray;
  Rank: Integer;
  CritAName, CritBName: string;
  IdxA, IdxB: Integer;
  Ratio: Double;
  CasesFiltered: T2DIntArray;
  P_Count: Integer;
  W: T2DDoubleArray;
  IsEqual: Boolean;
  MaxCrit, MinCrit: TDoubleArray;
  Ranges, Deltas: TDoubleArray;
  WinnerCounts: TIntArray;
  TotalTrials: Integer;
  Perturbed: T2DDoubleArray;
  PerturbVal: Double;
  MatrizConseqNorm: T2DDoubleArray;
  S: T2DDoubleArray;
  MatrizParaPar: T3DDoubleArray;
  NetFlowsPerCrit: T2DDoubleArray;
  PosFlow, NegFlow: TDoubleArray;
  Soma: Double;
  MaxScore: Double;
begin
  NumAlt := Length(MatrizConseq);
  NumCrit := Length(MatrizConseq[0]);
  IsComp := Rationality = 'compensatory';

  CasesOrdemCrit := GerarCases(NumCrit);
  NumCases := Length(CasesOrdemCrit);

  if Length(RankFilters) > 0 then
  begin
    SetLength(ValidMask, NumCases - 1);
    for k := 0 to NumCases - 2 do
      ValidMask[k] := True;

    for p := 0 to Length(RankFilters) - 1 do
    begin
      CritIdx := RankFilters[p];
      if CritIdx <> -1 then
      begin
        for k := 0 to NumCases - 2 do
        begin
          if CasesOrdemCrit[k][CritIdx] <> (p + 1) then
            ValidMask[k] := False;
        end;
      end;
    end;

    SetLength(FilteredPerms, 0);
    for k := 0 to NumCases - 2 do
    begin
      if ValidMask[k] then
      begin
        Len := Length(FilteredPerms);
        SetLength(FilteredPerms, Len + 1);
        FilteredPerms[Len] := CasesOrdemCrit[k];
      end;
    end;

    SetLength(CasesOrdemCrit, Length(FilteredPerms) + 1);
    for k := 0 to Length(FilteredPerms) - 1 do
      CasesOrdemCrit[k] := FilteredPerms[k];
    SetLength(CasesOrdemCrit[Length(FilteredPerms)], NumCrit);
    for i := 0 to NumCrit - 1 do
      CasesOrdemCrit[Length(FilteredPerms)][i] := 0;

    NumCases := Length(CasesOrdemCrit);
  end;

  EscalaRazao(MatrizConseq, TipoCrit, Niveis, MatrizConseqNormOrig, MaxCritOrig, MinCritOrig);

  CalcularSurrogate(
    CasesOrdemCrit, MatrizConseqNormOrig, TipoCrit,
    ResRoc, MatDifVg, MatPoa,
    ResProm, MatDifVgProm, MatPoaProm,
    M1, V1, V2, M2, V3, V4
  );

  SetLength(ActiveValidMask, NumCases);
  for k := 0 to NumCases - 1 do
    ActiveValidMask[k] := True;

  for i := 0 to HolisticAlt1.Count - 1 do
  begin
    Alt1Name := Trim(HolisticAlt1[i]);
    Alt2Name := Trim(HolisticAlt2[i]);
    Relation := HolisticRelation[i];
    if (Alt1Name = '') or (Alt2Name = '') or ((Relation <> '>=') and (Relation <> '<=')) then
      Continue;

    Idx1 := NomesAlt.IndexOf(Alt1Name);
    if Alt2Name = 'fictitious' then
      Idx2 := -9
    else
      Idx2 := NomesAlt.IndexOf(Alt2Name);

    if (Idx1 = -1) or (Idx2 = -1) then
      Continue;

    if IsComp then
    begin
      if Idx2 = -9 then
      begin
        FictVal := HolisticFictValue[i];
        for k := 0 to NumCases - 1 do
        begin
          if (k < Length(ResRoc)) and (Idx1 < Length(ResRoc[k])) then
          begin
            if Relation = '>=' then
              ActiveValidMask[k] := ActiveValidMask[k] and (ResRoc[k][Idx1] >= FictVal - 1e-9)
            else
              ActiveValidMask[k] := ActiveValidMask[k] and (ResRoc[k][Idx1] <= FictVal + 1e-9);
          end
          else
            ActiveValidMask[k] := False;
        end;
      end
      else
      begin
        for k := 0 to NumCases - 1 do
        begin
          if (k < Length(ResRoc)) and (Idx1 < Length(ResRoc[k])) and (Idx2 < Length(ResRoc[k])) then
          begin
            if Relation = '>=' then
              ActiveValidMask[k] := ActiveValidMask[k] and (ResRoc[k][Idx1] >= ResRoc[k][Idx2] - 1e-9)
            else
              ActiveValidMask[k] := ActiveValidMask[k] and (ResRoc[k][Idx1] <= ResRoc[k][Idx2] + 1e-9);
          end
          else
            ActiveValidMask[k] := False;
        end;
      end;
    end
    else
    begin
      if Idx2 = -9 then
      begin
        FictVal := HolisticFictValue[i];
        for k := 0 to NumCases - 1 do
        begin
          if (k < Length(ResProm)) and (Idx1 < Length(ResProm[k])) then
          begin
            if Relation = '>=' then
              ActiveValidMask[k] := ActiveValidMask[k] and (ResProm[k][Idx1] >= FictVal - 1e-9)
            else
              ActiveValidMask[k] := ActiveValidMask[k] and (ResProm[k][Idx1] <= FictVal + 1e-9);
          end
          else
            ActiveValidMask[k] := False;
        end;
      end
      else
      begin
        for k := 0 to NumCases - 1 do
        begin
          if (k < Length(ResProm)) and (Idx1 < Length(ResProm[k])) and (Idx2 < Length(ResProm[k])) then
          begin
            if Relation = '>=' then
              ActiveValidMask[k] := ActiveValidMask[k] and (ResProm[k][Idx1] >= ResProm[k][Idx2] - 1e-9)
            else
              ActiveValidMask[k] := ActiveValidMask[k] and (ResProm[k][Idx1] <= ResProm[k][Idx2] + 1e-9);
          end
          else
            ActiveValidMask[k] := False;
        end;
      end;
    end;
  end;

  if DecompCritA.Count > 0 then
  begin
    RocW := CalcularPesosRoc(NumCrit);
    SetLength(WeightsMatrixFilter, NumCases, NumCrit);
    for k := 0 to NumCases - 2 do
    begin
      for j := 0 to NumCrit - 1 do
      begin
        if (k < Length(CasesOrdemCrit)) and (j < Length(CasesOrdemCrit[k])) then
        begin
          Rank := CasesOrdemCrit[k][j] - 1;
          if (Rank >= 0) and (Rank < Length(RocW)) then
            WeightsMatrixFilter[k][j] := RocW[Rank]
          else
            WeightsMatrixFilter[k][j] := 0.0;
        end
        else
          WeightsMatrixFilter[k][j] := 0.0;
      end;
    end;
    for j := 0 to NumCrit - 1 do
      WeightsMatrixFilter[NumCases - 1][j] := 1.0 / NumCrit;

    for i := 0 to DecompCritA.Count - 1 do
    begin
      CritAName := DecompCritA[i];
      CritBName := DecompCritB[i];
      Relation := DecompRelation[i];
      Ratio := DecompRatio[i];

      IdxA := NomesCrit.IndexOf(CritAName);
      IdxB := NomesCrit.IndexOf(CritBName);

      if (IdxA <> -1) and (IdxB <> -1) and ((Relation = '>=') or (Relation = '<=')) then
      begin
        for k := 0 to NumCases - 1 do
        begin
          if Relation = '>=' then
            ActiveValidMask[k] := ActiveValidMask[k] and (WeightsMatrixFilter[k][IdxB] >= Ratio * WeightsMatrixFilter[k][IdxA] - 1e-9)
          else
            ActiveValidMask[k] := ActiveValidMask[k] and (WeightsMatrixFilter[k][IdxB] <= Ratio * WeightsMatrixFilter[k][IdxA] + 1e-9);
        end;
      end;
    end;
  end;

  SetLength(CasesFiltered, 0);
  for k := 0 to NumCases - 1 do
  begin
    if ActiveValidMask[k] then
    begin
      Len := Length(CasesFiltered);
      SetLength(CasesFiltered, Len + 1);
      CasesFiltered[Len] := CasesOrdemCrit[k];
    end;
  end;

  P_Count := Length(CasesFiltered);
  if P_Count = 0 then
    raise Exception.Create('Inconsistency in filters: 0 valid weight permutations.');

  RocW := CalcularPesosRoc(NumCrit);
  SetLength(W, P_Count, NumCrit);
  for k := 0 to P_Count - 1 do
  begin
    IsEqual := True;
    for j := 0 to NumCrit - 1 do
      if CasesFiltered[k][j] <> 0 then
      begin
        IsEqual := False;
        break;
      end;

    if IsEqual then
    begin
      for j := 0 to NumCrit - 1 do
        W[k][j] := 1.0 / NumCrit;
    end
    else
    begin
      for j := 0 to NumCrit - 1 do
      begin
        if (k < Length(CasesFiltered)) and (j < Length(CasesFiltered[k])) then
        begin
          Rank := CasesFiltered[k][j] - 1;
          if (Rank >= 0) and (Rank < Length(RocW)) then
            W[k][j] := RocW[Rank]
          else
            W[k][j] := 0.0;
        end
        else
          W[k][j] := 0.0;
      end;
    end;
  end;

  SetLength(MaxCrit, NumCrit);
  SetLength(MinCrit, NumCrit);
  for j := 0 to NumCrit - 1 do
  begin
    if not ((TipoCrit[j] = 2) or (TipoCrit[j] = 3)) then
    begin
      MaxCrit[j] := MatrizConseq[0][j];
      MinCrit[j] := MatrizConseq[0][j];
      for i := 1 to NumAlt - 1 do
      begin
        if MatrizConseq[i][j] > MaxCrit[j] then
          MaxCrit[j] := MatrizConseq[i][j];
        if MatrizConseq[i][j] < MinCrit[j] then
          MinCrit[j] := MatrizConseq[i][j];
      end;
    end
    else
    begin
      if Niveis[j] = 2 then
      begin
        MaxCrit[j] := 1.0;
        MinCrit[j] := 0.0;
      end
      else if Niveis[j] > 2 then
      begin
        MaxCrit[j] := Niveis[j];
        MinCrit[j] := 1.0;
      end
      else
      begin
        MaxCrit[j] := 1.0;
        MinCrit[j] := 0.0;
      end;
    end;
  end;

  SetLength(Ranges, NumCrit);
  SetLength(Deltas, NumCrit);
  for j := 0 to NumCrit - 1 do
  begin
    Ranges[j] := MaxCrit[j] - MinCrit[j];
    Deltas[j] := VariationsPct[j] * Ranges[j];
  end;

  SetLength(WinnerCounts, NumAlt);
  for i := 0 to NumAlt - 1 do
    WinnerCounts[i] := 0;

  TotalTrials := NumSimulations * P_Count;

  SetLength(Perturbed, NumAlt, NumCrit);
  SetLength(S, NumAlt, P_Count);
  SetLength(NetFlowsPerCrit, NumAlt, NumCrit);

  for m := 0 to NumSimulations - 1 do
  begin
    for i := 0 to NumAlt - 1 do
    begin
      for j := 0 to NumCrit - 1 do
      begin
        PerturbVal := (Random * 2.0 - 1.0) * Deltas[j];
        Perturbed[i][j] := MatrizConseq[i][j] + PerturbVal;

        if Perturbed[i][j] > MaxCrit[j] then
          Perturbed[i][j] := MaxCrit[j];
        if Perturbed[i][j] < MinCrit[j] then
          Perturbed[i][j] := MinCrit[j];

        if TipoCrit[j] >= 2 then
          Perturbed[i][j] := Round(Perturbed[i][j]);
      end;
    end;

    EscalaRazao(Perturbed, TipoCrit, Niveis, MatrizConseqNorm, MaxCritOrig, MinCritOrig);

    if IsComp then
    begin
      for i := 0 to NumAlt - 1 do
      begin
        for k := 0 to P_Count - 1 do
        begin
          Soma := 0.0;
          for j := 0 to NumCrit - 1 do
            Soma := Soma + MatrizConseqNorm[i][j] * W[k][j];
          S[i][k] := Soma;
        end;
      end;
    end
    else
    begin
      MatrizParaPar := ComparacaoParAPar(MatrizConseqNorm, TipoCrit);
      for c := 0 to NumCrit - 1 do
      begin
        SetLength(PosFlow, NumAlt);
        SetLength(NegFlow, NumAlt);
        for i := 0 to NumAlt - 1 do
        begin
          PosFlow[i] := 0.0;
          NegFlow[i] := 0.0;
          for j := 0 to NumAlt - 1 do
          begin
            PosFlow[i] := PosFlow[i] + MatrizParaPar[c][i][j];
            NegFlow[i] := NegFlow[i] + MatrizParaPar[c][j][i];
          end;
          PosFlow[i] := PosFlow[i] / (NumAlt - 1);
          NegFlow[i] := NegFlow[i] / (NumAlt - 1);
          NetFlowsPerCrit[i][c] := PosFlow[i] - NegFlow[i];
        end;
      end;

      for i := 0 to NumAlt - 1 do
      begin
        for k := 0 to P_Count - 1 do
        begin
          Soma := 0.0;
          for j := 0 to NumCrit - 1 do
            Soma := Soma + NetFlowsPerCrit[i][j] * W[k][j];
          S[i][k] := Soma;
        end;
      end;
    end;

    for k := 0 to P_Count - 1 do
    begin
      MaxScore := S[0][k];
      for i := 1 to NumAlt - 1 do
        if S[i][k] > MaxScore then
          MaxScore := S[i][k];

      for i := 0 to NumAlt - 1 do
      begin
        if Abs(S[i][k] - MaxScore) <= 1e-9 then
          WinnerCounts[i] := WinnerCounts[i] + 1;
      end;
    end;
  end;

  Result.Alternatives := TStringList.Create;
  for i := 0 to NomesAlt.Count - 1 do
    Result.Alternatives.Add(NomesAlt[i]);

  SetLength(Result.Probabilities, NumAlt);
  for i := 0 to NumAlt - 1 do
    Result.Probabilities[i] := WinnerCounts[i] / TotalTrials;

  SetLength(Result.Deltas, NumCrit);
  SetLength(Result.MinCrit, NumCrit);
  SetLength(Result.MaxCrit, NumCrit);
  for j := 0 to NumCrit - 1 do
  begin
    Result.Deltas[j] := Deltas[j];
    Result.MinCrit[j] := MinCrit[j];
    Result.MaxCrit[j] := MaxCrit[j];
  end;
end;

end.
