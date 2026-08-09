unit uPromethee;

interface

uses
  Classes, SysUtils, Math, uTypes;

function ComparacaoParAPar(const MatrizConseq: T2DDoubleArray; const TipoCrit: TIntArray): T3DDoubleArray;
procedure CalculoFluxos(
  const MatrizParaPar: T3DDoubleArray;
  const PesoCrit: TDoubleArray;
  var PositiveFlow: TDoubleArray;
  var NegativeFlow: TDoubleArray;
  var NetFlow: TDoubleArray
);

implementation

function ComparacaoParAPar(const MatrizConseq: T2DDoubleArray; const TipoCrit: TIntArray): T3DDoubleArray;
var
  NumAlt, NumCrit: Integer;
  xCrit, l, c: Integer;
  Result3D: T3DDoubleArray;
begin
  NumAlt := Length(MatrizConseq);
  if NumAlt = 0 then
    Exit;
  NumCrit := Length(MatrizConseq[0]);

  SetLength(Result3D, NumCrit, NumAlt, NumAlt);

  for xCrit := 0 to NumCrit - 1 do
  begin
    for l := 0 to NumAlt - 1 do
    begin
      for c := 0 to NumAlt - 1 do
      begin
        if l = c then
          Result3D[xCrit][l][c] := 0.0
        else
        begin
          if (TipoCrit[xCrit] = 1) or (TipoCrit[xCrit] = 3) or (TipoCrit[xCrit] = 5) then
          begin
            // Maximization
            if MatrizConseq[l][xCrit] > MatrizConseq[c][xCrit] then
              Result3D[xCrit][l][c] := 1.0
            else
              Result3D[xCrit][l][c] := 0.0;
          end
          else
          begin
            // Minimization
            if MatrizConseq[l][xCrit] < MatrizConseq[c][xCrit] then
              Result3D[xCrit][l][c] := 1.0
            else
              Result3D[xCrit][l][c] := 0.0;
          end;
        end;
      end;
    end;
  end;
  Result := Result3D;
end;

procedure CalculoFluxos(
  const MatrizParaPar: T3DDoubleArray;
  const PesoCrit: TDoubleArray;
  var PositiveFlow: TDoubleArray;
  var NegativeFlow: TDoubleArray;
  var NetFlow: TDoubleArray
);
var
  NumCrit, NumAlt: Integer;
  i, j, xCrit: Integer;
  SobClassMatrix: T2DDoubleArray;
  Soma: Double;
begin
  NumCrit := Length(MatrizParaPar);
  if NumCrit = 0 then
    Exit;
  NumAlt := Length(MatrizParaPar[0]);
  if NumAlt = 0 then
    Exit;

  SetLength(SobClassMatrix, NumAlt, NumAlt);
  SetLength(PositiveFlow, NumAlt);
  SetLength(NegativeFlow, NumAlt);
  SetLength(NetFlow, NumAlt);

  for i := 0 to NumAlt - 1 do
    for j := 0 to NumAlt - 1 do
      SobClassMatrix[i][j] := 0.0;

  for i := 0 to NumAlt - 1 do
  begin
    for j := 0 to NumAlt - 1 do
    begin
      if i <> j then
      begin
        for xCrit := 0 to NumCrit - 1 do
        begin
          if (xCrit < Length(PesoCrit)) and (i < Length(MatrizParaPar[xCrit])) and (j < Length(MatrizParaPar[xCrit][i])) then
            SobClassMatrix[i][j] := SobClassMatrix[i][j] + PesoCrit[xCrit] * MatrizParaPar[xCrit][i][j];
        end;
      end;
    end;
  end;

  for i := 0 to NumAlt - 1 do
  begin
    Soma := 0.0;
    for j := 0 to NumAlt - 1 do
      Soma := Soma + SobClassMatrix[i][j];
    if NumAlt > 1 then
      PositiveFlow[i] := Soma / (NumAlt - 1)
    else
      PositiveFlow[i] := 0.0;
  end;

  for j := 0 to NumAlt - 1 do
  begin
    Soma := 0.0;
    for i := 0 to NumAlt - 1 do
      Soma := Soma + SobClassMatrix[i][j];
    if NumAlt > 1 then
      NegativeFlow[j] := Soma / (NumAlt - 1)
    else
      NegativeFlow[j] := 0.0;
  end;

  for i := 0 to NumAlt - 1 do
    NetFlow[i] := PositiveFlow[i] - NegativeFlow[i];
end;

end.
