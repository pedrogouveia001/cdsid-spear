unit uNormalization;

interface

uses
  Classes, SysUtils, Math, uTypes;

procedure EscalaRazao(
  const MatrizConseq: T2DDoubleArray;
  const TipoCrit: TIntArray;
  const Niveis: TIntArray;
  var MatrizConseqNorm: T2DDoubleArray;
  var MaxCrit: TDoubleArray;
  var MinCrit: TDoubleArray
);

implementation

procedure EscalaRazao(
  const MatrizConseq: T2DDoubleArray;
  const TipoCrit: TIntArray;
  const Niveis: TIntArray;
  var MatrizConseqNorm: T2DDoubleArray;
  var MaxCrit: TDoubleArray;
  var MinCrit: TDoubleArray
);
var
  NumAlt, NumCrit: Integer;
  i, j: Integer;
  Denominator: Double;
  Val: Double;
begin
  NumAlt := Length(MatrizConseq);
  if NumAlt = 0 then
    Exit;
  NumCrit := Length(MatrizConseq[0]);

  SetLength(MatrizConseqNorm, NumAlt, NumCrit);
  SetLength(MaxCrit, NumCrit);
  SetLength(MinCrit, NumCrit);

  for i := 0 to NumCrit - 1 do
  begin
    if not ((TipoCrit[i] = 2) or (TipoCrit[i] = 3)) then
    begin
      // Continuous or Integer: find empirical min/max
      MaxCrit[i] := MatrizConseq[0][i];
      MinCrit[i] := MatrizConseq[0][i];
      for j := 1 to NumAlt - 1 do
      begin
        if MatrizConseq[j][i] > MaxCrit[i] then
          MaxCrit[i] := MatrizConseq[j][i];
        if MatrizConseq[j][i] < MinCrit[i] then
          MinCrit[i] := MatrizConseq[j][i];
      end;
    end
    else
    begin
      // Discrete
      if Niveis[i] = 2 then
      begin
        MaxCrit[i] := 1.0;
        MinCrit[i] := 0.0;
      end
      else if Niveis[i] > 2 then
      begin
        MaxCrit[i] := Niveis[i];
        MinCrit[i] := 1.0;
      end
      else
      begin
        MaxCrit[i] := 1.0;
        MinCrit[i] := 0.0;
      end;
    end;
  end;

  for i := 0 to NumCrit - 1 do
  begin
    Denominator := MaxCrit[i] - MinCrit[i];
    if Denominator = 0 then
      Denominator := 1.0;

    for j := 0 to NumAlt - 1 do
    begin
      Val := MatrizConseq[j][i];
      if (TipoCrit[i] = 1) or (TipoCrit[i] = 3) or (TipoCrit[i] = 5) then
      begin
        // Maximization
        MatrizConseqNorm[j][i] := (Val - MinCrit[i]) / Denominator;
      end
      else if (TipoCrit[i] = 0) or (TipoCrit[i] = 2) or (TipoCrit[i] = 4) then
      begin
        // Minimization
        MatrizConseqNorm[j][i] := (Val - MaxCrit[i]) / (-Denominator);
      end;
    end;
  end;
end;

end.
