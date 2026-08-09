unit uSurrogate;

interface

uses
  Classes, SysUtils, Math, uTypes, uPermutations, uPromethee;

function CalcularPesosRoc(NumCrit: Integer): TDoubleArray;

procedure CalcularSurrogate(
  const CasesOrdemCrit: T2DIntArray;
  const MatrizConseqNorm: T2DDoubleArray;
  const TipoCrit: TIntArray;
  var ResultadoRoc: T2DDoubleArray;
  var MatrizDifVg: T2DDoubleArray;
  var MatrizPoa: T2DIntArray;
  var ResultadoPromethee: T2DDoubleArray;
  var MatrizDifVgPromethee: T2DDoubleArray;
  var MatrizPoaPromethee: T2DIntArray;
  var MatrizSol: T2DIntArray;
  var ResultSol: TIntArray;
  var CaseSol: TIntArray;
  var MatrizSolPromethee: T2DIntArray;
  var ResultSolPromethee: TIntArray;
  var CaseSolPromethee: TIntArray
);

procedure ExtractUniqueSolutions(
  const MatrizPoa: T2DIntArray;
  var MatrizSol: T2DIntArray;
  var ResultSol: TIntArray;
  var CaseSol: TIntArray
);

implementation

function CalcularPesosRoc(NumCrit: Integer): TDoubleArray;
var
  i, j: Integer;
  Soma: Double;
begin
  SetLength(Result, NumCrit);
  for i := 0 to NumCrit - 1 do
  begin
    Soma := 0.0;
    for j := i + 1 to NumCrit do
    begin
      Soma := Soma + 1.0 / j;
    end;
    Result[i] := (1.0 / NumCrit) * Soma;
  end;
end;

procedure ExtractUniqueSolutions(
  const MatrizPoa: T2DIntArray;
  var MatrizSol: T2DIntArray;
  var ResultSol: TIntArray;
  var CaseSol: TIntArray
);
var
  NumCases, NumAlt: Integer;
  i, k, j: Integer;
  Row: TIntArray;
  Found: Boolean;
  LenSol: Integer;
  IsEqualRow: Boolean;
begin
  NumCases := Length(MatrizPoa) - 1; // Exclude equal-weight row
  if NumCases <= 0 then
    Exit;
  NumAlt := Length(MatrizPoa[0]);
  if NumAlt = 0 then
    Exit;

  SetLength(MatrizSol, 0);
  SetLength(ResultSol, 0);
  SetLength(CaseSol, NumCases + 1); // Extra element as in Python
  CaseSol[NumCases] := 0;

  for i := 0 to NumCases - 1 do
  begin
    Row := MatrizPoa[i];
    Found := False;
    LenSol := Length(MatrizSol);
    for k := 0 to LenSol - 1 do
    begin
      IsEqualRow := True;
      for j := 0 to NumAlt - 1 do
      begin
        if (j < Length(Row)) and (j < Length(MatrizSol[k])) then
        begin
          if Row[j] <> MatrizSol[k][j] then
          begin
            IsEqualRow := False;
            break;
          end;
        end
        else
        begin
          IsEqualRow := False;
          break;
        end;
      end;
      if IsEqualRow then
      begin
        if k < Length(ResultSol) then
          ResultSol[k] := ResultSol[k] + 1;
        if i < Length(CaseSol) then
          CaseSol[i] := k + 1; // 1-based index
        Found := True;
        break;
      end;
    end;

    if not Found then
    begin
      LenSol := Length(MatrizSol);
      SetLength(MatrizSol, LenSol + 1);
      SetLength(MatrizSol[LenSol], NumAlt);
      for j := 0 to NumAlt - 1 do
      begin
        if j < Length(Row) then
          MatrizSol[LenSol][j] := Row[j]
        else
          MatrizSol[LenSol][j] := 0;
      end;

      SetLength(ResultSol, LenSol + 1);
      ResultSol[LenSol] := 1;
      if i < Length(CaseSol) then
        CaseSol[i] := LenSol + 1;
    end;
  end;
end;

procedure CalcularSurrogate(
  const CasesOrdemCrit: T2DIntArray;
  const MatrizConseqNorm: T2DDoubleArray;
  const TipoCrit: TIntArray;
  var ResultadoRoc: T2DDoubleArray;
  var MatrizDifVg: T2DDoubleArray;
  var MatrizPoa: T2DIntArray;
  var ResultadoPromethee: T2DDoubleArray;
  var MatrizDifVgPromethee: T2DDoubleArray;
  var MatrizPoaPromethee: T2DIntArray;
  var MatrizSol: T2DIntArray;
  var ResultSol: TIntArray;
  var CaseSol: TIntArray;
  var MatrizSolPromethee: T2DIntArray;
  var ResultSolPromethee: TIntArray;
  var CaseSolPromethee: TIntArray
);
var
  NumCases, NumAlt, NumCrit: Integer;
  RocWeights: TDoubleArray;
  MatrizParaPar: T3DDoubleArray;
  PesoCritCase: TDoubleArray;
  k, i, j: Integer;
  Rank: Integer;
  AuxResultadoRoc, AuxResultadoProm: Double;
  PosFlow, NegFlow, NetFlow: TDoubleArray;
  PesoEqual: TDoubleArray;
begin
  NumCases := Length(CasesOrdemCrit);
  if NumCases = 0 then
    Exit;
  NumAlt := Length(MatrizConseqNorm);
  if NumAlt = 0 then
    Exit;
  NumCrit := Length(MatrizConseqNorm[0]);
  if NumCrit = 0 then
    Exit;

  RocWeights := CalcularPesosRoc(NumCrit);

  SetLength(ResultadoRoc, NumCases);
  SetLength(MatrizDifVg, NumCases);
  SetLength(MatrizPoa, NumCases);
  SetLength(ResultadoPromethee, NumCases);
  SetLength(MatrizDifVgPromethee, NumCases);
  SetLength(MatrizPoaPromethee, NumCases);

  for k := 0 to NumCases - 1 do
  begin
    SetLength(ResultadoRoc[k], NumAlt);
    SetLength(MatrizDifVg[k], NumAlt);
    SetLength(MatrizPoa[k], NumAlt);
    SetLength(ResultadoPromethee[k], NumAlt);
    SetLength(MatrizDifVgPromethee[k], NumAlt);
    SetLength(MatrizPoaPromethee[k], NumAlt);
  end;

  MatrizParaPar := ComparacaoParAPar(MatrizConseqNorm, TipoCrit);

  SetLength(PesoCritCase, NumCrit);

  for k := 0 to NumCases - 2 do
  begin
    for i := 0 to NumCrit - 1 do
    begin
      if (k < Length(CasesOrdemCrit)) and (i < Length(CasesOrdemCrit[k])) then
      begin
        Rank := CasesOrdemCrit[k][i] - 1;
        if (Rank >= 0) and (Rank < Length(RocWeights)) then
          PesoCritCase[i] := RocWeights[Rank]
        else
          PesoCritCase[i] := 0.0;
      end
      else
        PesoCritCase[i] := 0.0;
    end;

    for j := 0 to NumAlt - 1 do
    begin
      ResultadoRoc[k][j] := 0.0;
      for i := 0 to NumCrit - 1 do
      begin
        ResultadoRoc[k][j] := ResultadoRoc[k][j] + MatrizConseqNorm[j][i] * PesoCritCase[i];
      end;
    end;

    AuxResultadoRoc := ResultadoRoc[k][0];
    for j := 1 to NumAlt - 1 do
    begin
      if ResultadoRoc[k][j] > AuxResultadoRoc then
        AuxResultadoRoc := ResultadoRoc[k][j];
    end;

    for j := 0 to NumAlt - 1 do
    begin
      MatrizDifVg[k][j] := AuxResultadoRoc - ResultadoRoc[k][j];
      if Abs(AuxResultadoRoc - ResultadoRoc[k][j]) <= 1e-9 then
        MatrizPoa[k][j] := 1
      else
        MatrizPoa[k][j] := 0;
    end;

    CalculoFluxos(MatrizParaPar, PesoCritCase, PosFlow, NegFlow, NetFlow);
    for j := 0 to NumAlt - 1 do
    begin
      if j < Length(NetFlow) then
        ResultadoPromethee[k][j] := NetFlow[j]
      else
        ResultadoPromethee[k][j] := 0.0;
    end;

    AuxResultadoProm := ResultadoPromethee[k][0];
    for j := 1 to NumAlt - 1 do
    begin
      if ResultadoPromethee[k][j] > AuxResultadoProm then
        AuxResultadoProm := ResultadoPromethee[k][j];
    end;

    for j := 0 to NumAlt - 1 do
    begin
      MatrizDifVgPromethee[k][j] := AuxResultadoProm - ResultadoPromethee[k][j];
      if Abs(AuxResultadoProm - ResultadoPromethee[k][j]) <= 1e-9 then
        MatrizPoaPromethee[k][j] := 1
      else
        MatrizPoaPromethee[k][j] := 0;
    end;
  end;

  k := NumCases - 1;
  SetLength(PesoEqual, NumCrit);
  for i := 0 to NumCrit - 1 do
    PesoEqual[i] := 1.0 / NumCrit;

  for j := 0 to NumAlt - 1 do
  begin
    ResultadoRoc[k][j] := 0.0;
    for i := 0 to NumCrit - 1 do
    begin
      ResultadoRoc[k][j] := ResultadoRoc[k][j] + MatrizConseqNorm[j][i] * PesoEqual[i];
    end;
  end;

  AuxResultadoRoc := ResultadoRoc[k][0];
  for j := 1 to NumAlt - 1 do
  begin
    if ResultadoRoc[k][j] > AuxResultadoRoc then
      AuxResultadoRoc := ResultadoRoc[k][j];
  end;

  for j := 0 to NumAlt - 1 do
  begin
    MatrizDifVg[k][j] := AuxResultadoRoc - ResultadoRoc[k][j];
    if Abs(AuxResultadoRoc - ResultadoRoc[k][j]) <= 1e-9 then
      MatrizPoa[k][j] := 1
    else
      MatrizPoa[k][j] := 0;
  end;

  CalculoFluxos(MatrizParaPar, PesoEqual, PosFlow, NegFlow, NetFlow);
  for j := 0 to NumAlt - 1 do
  begin
    if j < Length(NetFlow) then
      ResultadoPromethee[k][j] := NetFlow[j]
    else
      ResultadoPromethee[k][j] := 0.0;
  end;

  AuxResultadoProm := ResultadoPromethee[k][0];
  for j := 1 to NumAlt - 1 do
  begin
    if ResultadoPromethee[k][j] > AuxResultadoProm then
      AuxResultadoProm := ResultadoPromethee[k][j];
  end;

  for j := 0 to NumAlt - 1 do
  begin
    MatrizDifVgPromethee[k][j] := AuxResultadoProm - ResultadoPromethee[k][j];
    if Abs(AuxResultadoProm - ResultadoPromethee[k][j]) <= 1e-9 then
      MatrizPoaPromethee[k][j] := 1
    else
      MatrizPoaPromethee[k][j] := 0;
  end;

  ExtractUniqueSolutions(MatrizPoa, MatrizSol, ResultSol, CaseSol);
  ExtractUniqueSolutions(MatrizPoaPromethee, MatrizSolPromethee, ResultSolPromethee, CaseSolPromethee);
end;

end.
