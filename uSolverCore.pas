unit uSolverCore;

interface

uses
  Classes, SysUtils, DBXJSON, StrUtils, Types, Math,
  ZConnection, ZDataset, DB, uTypes, uJsonHelper;

function SaveProblemCore(const ReqJson: string; UserId: Integer; var ProblemId: Integer; out ErrorMsg: string): Boolean;
procedure SolveProblemCore(const ReqJson: string; out RespJson: string);
procedure RunSensitivityCore(const ReqJson: string; out RespJson: string);
function LoadProblemCore(ProblemId: Integer; UserId: Integer; out LoadedJson: string): Boolean;

implementation

uses
  ServerController, uPermutations, uNormalization, uPromethee, uSurrogate, uStats,
  uDecisionRules, uElicitation, uSensitivity;

function SaveProblemCore(const ReqJson: string; UserId: Integer; var ProblemId: Integer; out ErrorMsg: string): Boolean;
var
  JsonObj: TJSONObject;
  Conn: TZConnection;
  Query: TZQuery;
  ProblemName, rationality: string;
  nomeCrit, nomeAlt: TStringList;
  tipoCrit, niveisCrit, CritIds, AltIds: TIntArray;
  matrizConseq: T2DDoubleArray;
  holisticAlt1, holisticAlt2, holisticRelation: TStringList;
  holisticFictValue: TDoubleArray;
  decompCritA, decompCritB, decompRelation: TStringList;
  decompRatio: TDoubleArray;
  i, AltIdx, CritIdx: Integer;
  Alt1Name, Alt2Name, Relation, CritAName, CritBName: string;
  FictVal, Ratio: Double;
begin
  Result := False;
  ErrorMsg := '';
  
  JsonObj := ParseJson(ReqJson);
  if JsonObj = nil then
  begin
    ErrorMsg := 'Invalid JSON payload';
    Exit;
  end;

  nomeCrit := TStringList.Create;
  nomeAlt := TStringList.Create;
  holisticAlt1 := TStringList.Create;
  holisticAlt2 := TStringList.Create;
  holisticRelation := TStringList.Create;
  decompCritA := TStringList.Create;
  decompCritB := TStringList.Create;
  decompRelation := TStringList.Create;

  if not IWServerController.GetDBConn(Conn, Query) then
  begin
    ErrorMsg := 'Erro de conexão com o banco de dados';
    nomeCrit.Free; nomeAlt.Free;
    holisticAlt1.Free; holisticAlt2.Free; holisticRelation.Free;
    decompCritA.Free; decompCritB.Free; decompRelation.Free;
    JsonObj.Free;
    Exit;
  end;

  try
    Conn.StartTransaction;
    try
      ProblemId := GetInt(JsonObj, 'problemId', 0);
      ProblemName := GetStr(JsonObj, 'problemName', 'SPEAR Problem');
      rationality := GetStr(JsonObj, 'rationality', 'compensatory');
      
      nomeCrit.Free;
      nomeCrit := GetStringArray(JsonObj, 'criteria');
      if nomeCrit.Count = 0 then
      begin
        nomeCrit.Free;
        nomeCrit := GetStringArray(JsonObj, 'nomeCrit');
      end;

      tipoCrit := GetIntArray(JsonObj, 'criterionTypes');
      if Length(tipoCrit) = 0 then
        tipoCrit := GetIntArray(JsonObj, 'tipoCrit');

      niveisCrit := GetIntArray(JsonObj, 'levels');
      if Length(niveisCrit) = 0 then
        niveisCrit := GetIntArray(JsonObj, 'niveisCrit');

      nomeAlt.Free;
      nomeAlt := GetStringArray(JsonObj, 'alternatives');
      if nomeAlt.Count = 0 then
      begin
        nomeAlt.Free;
        nomeAlt := GetStringArray(JsonObj, 'nomeAlt');
      end;

      matrizConseq := Get2DDoubleArray(JsonObj, 'matrix');
      if Length(matrizConseq) = 0 then
        matrizConseq := Get2DDoubleArray(JsonObj, 'matrizConseq');
      
      if ProblemId > 0 then
      begin
        // Check ownership
        Query.SQL.Text := 'SELECT id FROM problema WHERE id = :id AND ID_usuario = :UserId';
        Query.ParamByName('id').AsInteger := ProblemId;
        Query.ParamByName('UserId').AsInteger := UserId;
        Query.Open;
        if Query.Eof then
          raise Exception.Create('Unauthorized problem edit.');
        Query.Close;
        
        // Update problem name and rationality
        Query.SQL.Text := 'UPDATE problema SET nome_problema = :name, racionalidade = :rationality WHERE id = :id';
        Query.ParamByName('name').AsString := ProblemName;
        Query.ParamByName('rationality').AsString := rationality;
        Query.ParamByName('id').AsInteger := ProblemId;
        Query.ExecSQL;
        
        // Delete old configurations
        Query.SQL.Text := 'DELETE FROM matrizconsequencia WHERE ID_problema = :id';
        Query.ParamByName('id').AsInteger := ProblemId;
        Query.ExecSQL;
        Query.SQL.Text := 'DELETE FROM criterio WHERE ID_problema = :id';
        Query.ParamByName('id').AsInteger := ProblemId;
        Query.ExecSQL;
        Query.SQL.Text := 'DELETE FROM alternativa WHERE ID_problema = :id';
        Query.ParamByName('id').AsInteger := ProblemId;
        Query.ExecSQL;
      end
      else
      begin
        Query.SQL.Text := 'INSERT INTO problema (nome_problema, ID_usuario, racionalidade) VALUES (:name, :UserId, :rationality)';
        Query.ParamByName('name').AsString := ProblemName;
        Query.ParamByName('UserId').AsInteger := UserId;
        Query.ParamByName('rationality').AsString := rationality;
        Query.ExecSQL;
        
        Query.SQL.Text := 'SELECT LAST_INSERT_ID();';
        Query.Open;
        ProblemId := Query.Fields[0].AsInteger;
        Query.Close;
      end;

      // Insert Criteria
      SetLength(CritIds, nomeCrit.Count);
      for i := 0 to nomeCrit.Count - 1 do
      begin
        Query.SQL.Text := 'INSERT INTO criterio (nome_criterio, tipo_criterio, niveis, ID_problema) VALUES (:name, :tipo, :niveis, :prob_id)';
        Query.ParamByName('name').AsString := nomeCrit[i];
        Query.ParamByName('tipo').AsInteger := tipoCrit[i];
        Query.ParamByName('niveis').AsInteger := niveisCrit[i];
        Query.ParamByName('prob_id').AsInteger := ProblemId;
        Query.ExecSQL;
        
        Query.SQL.Text := 'SELECT LAST_INSERT_ID();';
        Query.Open;
        CritIds[i] := Query.Fields[0].AsInteger;
        Query.Close;
      end;

      // Insert Alternatives
      SetLength(AltIds, nomeAlt.Count);
      for i := 0 to nomeAlt.Count - 1 do
      begin
        Query.SQL.Text := 'INSERT INTO alternativa (nome_alternativa, ID_problema) VALUES (:name, :prob_id)';
        Query.ParamByName('name').AsString := nomeAlt[i];
        Query.ParamByName('prob_id').AsInteger := ProblemId;
        Query.ExecSQL;
        
        Query.SQL.Text := 'SELECT LAST_INSERT_ID();';
        Query.Open;
        AltIds[i] := Query.Fields[0].AsInteger;
        Query.Close;
      end;

      // Insert Consequence Matrix values
      for AltIdx := 0 to nomeAlt.Count - 1 do
      begin
        for CritIdx := 0 to nomeCrit.Count - 1 do
        begin
          Query.SQL.Text := 'INSERT INTO matrizconsequencia (ID_alternativa, ID_criterio, valor_performance, ID_problema) VALUES (:alt_id, :crit_id, :val, :prob_id)';
          Query.ParamByName('alt_id').AsInteger := AltIds[AltIdx];
          Query.ParamByName('crit_id').AsInteger := CritIds[CritIdx];
          Query.ParamByName('val').AsFloat := matrizConseq[AltIdx][CritIdx];
          Query.ParamByName('prob_id').AsInteger := ProblemId;
          Query.ExecSQL;
        end;
      end;

      // Delete/Insert holistic evaluations
      Query.SQL.Text := 'DELETE FROM avaliacaoholistica WHERE ID_problema = :id';
      Query.ParamByName('id').AsInteger := ProblemId;
      Query.ExecSQL;
      
      GetHolisticEvaluations(JsonObj, holisticAlt1, holisticAlt2, holisticRelation, holisticFictValue);
      for i := 0 to holisticAlt1.Count - 1 do
      begin
        Alt1Name := holisticAlt1[i];
        Alt2Name := holisticAlt2[i];
        Relation := holisticRelation[i];
        FictVal := holisticFictValue[i];
        if (Alt1Name <> '') and (Alt2Name <> '') and ((Relation = '>=') or (Relation = '<=')) then
        begin
          Query.SQL.Text := 'INSERT INTO avaliacaoholistica (ID_problema, alt1_nome, alt2_nome, tipo_relacao, fictitious_value) VALUES (:prob_id, :alt1, :alt2, :rel, :fict)';
          Query.ParamByName('prob_id').AsInteger := ProblemId;
          Query.ParamByName('alt1').AsString := Alt1Name;
          Query.ParamByName('alt2').AsString := Alt2Name;
          Query.ParamByName('rel').AsString := Relation;
          if FictVal >= 0 then
            Query.ParamByName('fict').AsFloat := FictVal
          else
            Query.ParamByName('fict').Clear;
          Query.ExecSQL;
        end;
      end;

      // Delete/Insert decomposition preferences
      Query.SQL.Text := 'DELETE FROM decomposicaopreferencia WHERE ID_problema = :id';
      Query.ParamByName('id').AsInteger := ProblemId;
      Query.ExecSQL;

      GetDecompositionPreferences(JsonObj, decompCritA, decompCritB, decompRelation, decompRatio);
      for i := 0 to decompCritA.Count - 1 do
      begin
        CritAName := decompCritA[i];
        CritBName := decompCritB[i];
        Relation := decompRelation[i];
        Ratio := decompRatio[i];
        if (CritAName <> '') and (CritBName <> '') and ((Relation = '>=') or (Relation = '<=')) then
        begin
          Query.SQL.Text := 'INSERT INTO decomposicaopreferencia (ID_problema, criterio_a, criterio_b, tipo_relacao, valor_ratio) VALUES (:prob_id, :crit_a, :crit_b, :rel, :ratio)';
          Query.ParamByName('prob_id').AsInteger := ProblemId;
          Query.ParamByName('crit_a').AsString := CritAName;
          Query.ParamByName('crit_b').AsString := CritBName;
          Query.ParamByName('rel').AsString := Relation;
          Query.ParamByName('ratio').AsFloat := Ratio;
          Query.ExecSQL;
        end;
      end;

      Conn.Commit;
      Result := True;
    except
      on E: Exception do
      begin
        Conn.Rollback;
        ErrorMsg := E.Message;
      end;
    end;
  finally
    nomeCrit.Free;
    nomeAlt.Free;
    holisticAlt1.Free;
    holisticAlt2.Free;
    holisticRelation.Free;
    decompCritA.Free;
    decompCritB.Free;
    decompRelation.Free;
    Query.Free;
    Conn.Free;
    JsonObj.Free;
  end;
end;

procedure SolveProblemCore(const ReqJson: string; out RespJson: string);
var
  JsonObj: TJSONObject;
  nomeCrit, nomeAlt: TStringList;
  tipoCrit, niveisCrit, rankFilters: TIntArray;
  matrizConseq: T2DDoubleArray;
  rationality: string;
  holisticAlt1, holisticAlt2, holisticRelation: TStringList;
  holisticFictValue: TDoubleArray;
  decompCritA, decompCritB, decompRelation: TStringList;
  decompRatio: TDoubleArray;
  excludedPairsA, excludedPairsB: TIntArray;
  CasesOrdemCrit: T2DIntArray;
  numCrit, numAlt, NumCases: Integer;
  k, p, i, j, Len, Idx1, Idx2, IdxA, IdxB, LenAct, L_Act, L_C, CritIdx: Integer;
  ValidMask: array of Boolean;
  FilteredPerms: T2DIntArray;
  MatrizConseqNorm: T2DDoubleArray;
  MaxCrit, MinCrit: TDoubleArray;
  ResRoc, ResProm: T2DDoubleArray;
  MatDifVg, MatDifVgProm: T2DDoubleArray;
  MatPoa, MatPoaProm: T2DIntArray;
  MatrizSol, MatrizSolProm: T2DIntArray;
  ResultSol, CaseSol, ResultSolProm, CaseSolProm: TIntArray;
  ActiveValidMask: array of Boolean;
  IsComp, NextQ, Converged: Boolean;
  FictVal, Ratio: Double;
  RocW: TDoubleArray;
  WeightsMatrix: T2DDoubleArray;
  Rank, ActiveTotalPermuted: Integer;
  ResultadoActive, MatrizDifVgActive: T2DDoubleArray;
  MatrizPoaActiveInt: T2DIntArray;
  Stats: TStatsResult;
  TotalCases: Integer;
  DecRules: TDecisionRuleResult;
  ActiveFilteredPerms: T2DIntArray;
  ElicData: TElicitationResult;
  NextQJson: string;
  ExPair: TJSONPair;
  ExArr, SubArr: TJSONArray;
  RocPayload, PromPayload, RawPoaRoc, RawPoaProm, RawResRoc, RawResProm, CasesRocRaw, CasesPromRaw: string;
  fs_fmt: TFormatSettings;
  Alt1Name, Alt2Name, Relation, CritAName, CritBName, ModelName: string;
begin
  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs_fmt);
  fs_fmt.DecimalSeparator := '.';

  JsonObj := ParseJson(ReqJson);
  if JsonObj = nil then
  begin
    RespJson := '{"success":false,"error":"Invalid JSON"}';
    Exit;
  end;

  nomeCrit := TStringList.Create;
  nomeAlt := TStringList.Create;
  holisticAlt1 := TStringList.Create;
  holisticAlt2 := TStringList.Create;
  holisticRelation := TStringList.Create;
  decompCritA := TStringList.Create;
  decompCritB := TStringList.Create;
  decompRelation := TStringList.Create;

  try
    numCrit := GetInt(JsonObj, 'numCrit');
    numAlt := GetInt(JsonObj, 'numAlt');
     tipoCrit := GetIntArray(JsonObj, 'tipoCrit');
    if Length(tipoCrit) = 0 then
      tipoCrit := GetIntArray(JsonObj, 'criterionTypes');

    niveisCrit := GetIntArray(JsonObj, 'niveisCrit');
    if Length(niveisCrit) = 0 then
      niveisCrit := GetIntArray(JsonObj, 'levels');

    nomeCrit.Free;
    nomeCrit := GetStringArray(JsonObj, 'nomeCrit');
    if nomeCrit.Count = 0 then
    begin
      nomeCrit.Free;
      nomeCrit := GetStringArray(JsonObj, 'criteria');
    end;

    nomeAlt.Free;
    nomeAlt := GetStringArray(JsonObj, 'nomeAlt');
    if nomeAlt.Count = 0 then
    begin
      nomeAlt.Free;
      nomeAlt := GetStringArray(JsonObj, 'alternatives');
    end;

    matrizConseq := Get2DDoubleArray(JsonObj, 'matrizConseq');
    if Length(matrizConseq) = 0 then
      matrizConseq := Get2DDoubleArray(JsonObj, 'matrix');

    rationality := GetStr(JsonObj, 'rationality', 'compensatory');
    rankFilters := GetIntArray(JsonObj, 'rankFilters');
    
    GetHolisticEvaluations(JsonObj, holisticAlt1, holisticAlt2, holisticRelation, holisticFictValue);
    GetDecompositionPreferences(JsonObj, decompCritA, decompCritB, decompRelation, decompRatio);
    
    // 1. Permutations
    CasesOrdemCrit := GerarCases(numCrit);
    NumCases := Length(CasesOrdemCrit);
    
    // Filter by rank position filters
    if Length(rankFilters) > 0 then
    begin
      SetLength(ValidMask, NumCases - 1);
      for k := 0 to NumCases - 2 do
        ValidMask[k] := True;

      for p := 0 to Length(rankFilters) - 1 do
      begin
        CritIdx := rankFilters[p];
        if CritIdx <> -1 then
        begin
          for k := 0 to NumCases - 2 do
            if CasesOrdemCrit[k][CritIdx] <> (p + 1) then
              ValidMask[k] := False;
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

      if Length(FilteredPerms) = 0 then
      begin
        RespJson := '{"success":false,"error":"Inconsistência detectada: A ordenação dos critérios não deixa permutações válidas."}';
        Exit;
      end;

      SetLength(CasesOrdemCrit, Length(FilteredPerms) + 1);
      for k := 0 to Length(FilteredPerms) - 1 do
        CasesOrdemCrit[k] := FilteredPerms[k];
      SetLength(CasesOrdemCrit[Length(FilteredPerms)], numCrit);
      for i := 0 to numCrit - 1 do
        CasesOrdemCrit[Length(FilteredPerms)][i] := 0;

      NumCases := Length(CasesOrdemCrit);
    end;

    // 2. Normalization
    EscalaRazao(matrizConseq, tipoCrit, niveisCrit, MatrizConseqNorm, MaxCrit, MinCrit);

    // 3. Solve Originally
    CalcularSurrogate(
      CasesOrdemCrit, MatrizConseqNorm, tipoCrit,
      ResRoc, MatDifVg, MatPoa,
      ResProm, MatDifVgProm, MatPoaProm,
      MatrizSol, ResultSol, CaseSol,
      MatrizSolProm, ResultSolProm, CaseSolProm
    );

    IsComp := rationality = 'compensatory';

    // Active Valid Mask Filtering
    SetLength(ActiveValidMask, NumCases);
    for k := 0 to NumCases - 1 do
      ActiveValidMask[k] := True;

    for i := 0 to holisticAlt1.Count - 1 do
    begin
      Alt1Name := Trim(holisticAlt1[i]);
      Alt2Name := Trim(holisticAlt2[i]);
      Relation := holisticRelation[i];
      if (Alt1Name = '') or (Alt2Name = '') or ((Relation <> '>=') and (Relation <> '<=')) then
        Continue;

      Idx1 := nomeAlt.IndexOf(Alt1Name);
      if Alt2Name = 'fictitious' then
        Idx2 := -9
      else
        Idx2 := nomeAlt.IndexOf(Alt2Name);

      if (Idx1 = -1) or (Idx2 = -1) then
        Continue;

      if IsComp then
      begin
        if Idx2 = -9 then
        begin
          FictVal := holisticFictValue[i];
          if FictVal < 0 then
          begin
            if (Length(ResRoc) > 0) and (Length(ResRoc[0]) > 0) then
            begin
              FictVal := ResRoc[0][0];
              for k := 0 to NumCases - 1 do
                for j := 0 to numAlt - 1 do
                  if (k < Length(ResRoc)) and (j < Length(ResRoc[k])) then
                    if ResRoc[k][j] < FictVal then
                      FictVal := ResRoc[k][j];
            end
            else
              FictVal := 0.0;
          end;
          
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
          FictVal := holisticFictValue[i];
          if FictVal < 0 then
          begin
            if (Length(ResProm) > 0) and (Length(ResProm[0]) > 0) then
            begin
              FictVal := ResProm[0][0];
              for k := 0 to NumCases - 1 do
                for j := 0 to numAlt - 1 do
                  if (k < Length(ResProm)) and (j < Length(ResProm[k])) then
                    if ResProm[k][j] < FictVal then
                      FictVal := ResProm[k][j];
            end
            else
              FictVal := 0.0;
          end;
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

    // Apply decomposition preferences
    RocW := CalcularPesosRoc(numCrit);
    SetLength(WeightsMatrix, NumCases, numCrit);
    for k := 0 to NumCases - 2 do
    begin
      for j := 0 to numCrit - 1 do
      begin
        Rank := CasesOrdemCrit[k][j] - 1;
        WeightsMatrix[k][j] := RocW[Rank];
      end;
    end;
    for j := 0 to numCrit - 1 do
      WeightsMatrix[NumCases - 1][j] := 1.0 / numCrit;

    for i := 0 to decompCritA.Count - 1 do
    begin
      CritAName := decompCritA[i];
      CritBName := decompCritB[i];
      Relation := decompRelation[i];
      Ratio := decompRatio[i];

      IdxA := nomeCrit.IndexOf(CritAName);
      IdxB := nomeCrit.IndexOf(CritBName);

      if (IdxA <> -1) and (IdxB <> -1) and ((Relation = '>=') or (Relation = '<=')) then
      begin
        for k := 0 to NumCases - 1 do
        begin
          if Relation = '>=' then
            ActiveValidMask[k] := ActiveValidMask[k] and (WeightsMatrix[k][IdxB] >= Ratio * WeightsMatrix[k][IdxA] - 1e-9)
          else
            ActiveValidMask[k] := ActiveValidMask[k] and (WeightsMatrix[k][IdxB] <= Ratio * WeightsMatrix[k][IdxA] + 1e-9);
        end;
      end;
    end;

    // Validate active total permuted
    ActiveTotalPermuted := 0;
    for k := 0 to NumCases - 2 do
      if ActiveValidMask[k] then
        Inc(ActiveTotalPermuted);

    if ActiveTotalPermuted = 0 then
    begin
      ModelName := 'Modelo Aditivo (ROC)';
      if not IsComp then ModelName := 'Sobreclassificação (PROMETHEE)';
      RespJson := '{"success":false,"error":"Inconsistência detectada: As preferências holísticas ou de decomposição são incompatíveis com os dados do ' + ModelName + ', não restando nenhum caso de pesos válido."}';
      Exit;
    end;

    // Apply filters to active results
    SetLength(ResultadoActive, 0);
    SetLength(MatrizDifVgActive, 0);
    SetLength(MatrizPoaActiveInt, 0);

    for k := 0 to NumCases - 1 do
    begin
      if ActiveValidMask[k] then
      begin
        LenAct := Length(ResultadoActive);
        SetLength(ResultadoActive, LenAct + 1);
        SetLength(MatrizDifVgActive, LenAct + 1);
        SetLength(MatrizPoaActiveInt, LenAct + 1);

        SetLength(ResultadoActive[LenAct], numAlt);
        SetLength(MatrizDifVgActive[LenAct], numAlt);
        SetLength(MatrizPoaActiveInt[LenAct], numAlt);

        for j := 0 to numAlt - 1 do
        begin
          if IsComp then
          begin
            if (k < Length(ResRoc)) and (j < Length(ResRoc[k])) then
              ResultadoActive[LenAct][j] := ResRoc[k][j]
            else
              ResultadoActive[LenAct][j] := 0.0;

            if (k < Length(MatDifVg)) and (j < Length(MatDifVg[k])) then
              MatrizDifVgActive[LenAct][j] := MatDifVg[k][j]
            else
              MatrizDifVgActive[LenAct][j] := 0.0;

            if (k < Length(MatPoa)) and (j < Length(MatPoa[k])) then
              MatrizPoaActiveInt[LenAct][j] := MatPoa[k][j]
            else
              MatrizPoaActiveInt[LenAct][j] := 0;
          end
          else
          begin
            if (k < Length(ResProm)) and (j < Length(ResProm[k])) then
              ResultadoActive[LenAct][j] := ResProm[k][j]
            else
              ResultadoActive[LenAct][j] := 0.0;

            if (k < Length(MatDifVgProm)) and (j < Length(MatDifVgProm[k])) then
              MatrizDifVgActive[LenAct][j] := MatDifVgProm[k][j]
            else
              MatrizDifVgActive[LenAct][j] := 0.0;

            if (k < Length(MatPoaProm)) and (j < Length(MatPoaProm[k])) then
              MatrizPoaActiveInt[LenAct][j] := MatPoaProm[k][j]
            else
              MatrizPoaActiveInt[LenAct][j] := 0;
          end;
        end;
      end;
    end;

    // Extract solutions for active
    ExtractUniqueSolutions(MatrizPoaActiveInt, MatrizSol, ResultSol, CaseSol);
    Stats := ComputeStatistics(MatrizSol, ResultSol, CaseSol, MatrizDifVgActive);
    TotalCases := 0;
    for i := 0 to Length(ResultSol) - 1 do
      TotalCases := TotalCases + ResultSol[i];
    
    DecRules := ApplyDecisionRules(ResultSol, MatrizSol, Stats, TotalCases);

    // Interactive elicitation data
    SetLength(ActiveFilteredPerms, 0);
    for k := 0 to NumCases - 1 do
    begin
      if ActiveValidMask[k] then
      begin
        L_Act := Length(ActiveFilteredPerms);
        SetLength(ActiveFilteredPerms, L_Act + 1);
        ActiveFilteredPerms[L_Act] := CasesOrdemCrit[k];
      end;
    end;

    ElicData := AnaliseParaElicitacao(ActiveFilteredPerms, MatrizPoaActiveInt, ResultSol, MatrizSol);

    // Next decomposition question
    SetLength(excludedPairsA, 0);
    SetLength(excludedPairsB, 0);
    ExPair := GetPairByName(JsonObj, 'excludedPairs');
    if (ExPair <> nil) and (ExPair.JsonValue is TJSONArray) then
    begin
      ExArr := TJSONArray(ExPair.JsonValue);
      SetLength(excludedPairsA, ExArr.Size);
      SetLength(excludedPairsB, ExArr.Size);
      for i := 0 to ExArr.Size - 1 do
      begin
        if ExArr.Get(i) is TJSONArray then
        begin
          SubArr := TJSONArray(ExArr.Get(i));
          if SubArr.Size >= 2 then
          begin
            excludedPairsA[i] := StrToIntDef(SubArr.Get(0).Value, 0);
            excludedPairsB[i] := StrToIntDef(SubArr.Get(1).Value, 0);
          end;
        end;
      end;
    end;

    Converged := Length(MatrizSol) = 1;
    NextQJson := 'null';
    if not Converged then
    begin
      if IsComp then
      begin
        NextQ := SearchNextDecompositionQuestion(
          WeightsMatrix, ActiveValidMask, numCrit,
          MatPoa, excludedPairsA, excludedPairsB
        );
      end
      else
      begin
        NextQ := SearchNextDecompositionQuestion(
          WeightsMatrix, ActiveValidMask, numCrit,
          MatPoaProm, excludedPairsA, excludedPairsB
        );
      end;
      if NextQ then
      begin
        NextQJson := Format(
          '{"critA":"%s","critB":"%s","critAIdx":%d,"critBIdx":%d,"ratio":%s}',
          [nomeCrit[NextQuestionResult.CritAIdx],
           nomeCrit[NextQuestionResult.CritBIdx],
           NextQuestionResult.CritAIdx,
           NextQuestionResult.CritBIdx,
           FloatToStr(NextQuestionResult.Ratio, fs_fmt)]
        );
      end;
    end;

    // Build Payload responses
    if IsComp then
    begin
      RocPayload := Format(
        '{"totalCases":%d,"matrizSol":%s,"resultSol":%s,' +
        '"stats":{"media_dif_sol":%s,"max_dif_sol":%s,"min_dif_sol":%s,' +
        '"media_geral":%s,"maximo_geral":%s,"minimo_geral":%s,' +
        '"media_geral_naosol":%s,"maximo_geral_naosol":%s,"minimo_geral_naosol":%s,' +
        '"desvio_padrao_dif_sol":%s,"desvio_padrao_geral":%s},' +
        '"decisionRule":{"status":"%s","recommended_alts":%s,"probability":%s}}',
        [TotalCases,
         T2DIntArrayToJson(MatrizSol),
         IntArrayToJson(ResultSol),
         T2DDoubleArrayToJson(Stats.MediaDifSol),
         T2DDoubleArrayToJson(Stats.MaxDifSol),
         T2DDoubleArrayToJson(Stats.MinDifSol),
         DoubleArrayToJson(Stats.MediaGeral),
         DoubleArrayToJson(Stats.MaximoGeral),
         DoubleArrayToJson(Stats.MinimoGeral),
         DoubleArrayToJson(Stats.MediaGeralNaoSol),
         DoubleArrayToJson(Stats.MaximoGeralNaoSol),
         DoubleArrayToJson(Stats.MinimoGeralNaoSol),
         T2DDoubleArrayToJson(Stats.DesvioPadraoDifSol),
         DoubleArrayToJson(Stats.DesvioPadraoGeral),
         DecRules.Status,
         IntArrayToJson(DecRules.RecommendedAlts),
         FloatToStr(DecRules.Probability, fs_fmt)]
      );
      PromPayload := '{"totalCases":0,"matrizSol":[[]],"resultSol":[],"stats":{},"decisionRule":{"status":"N/A","recommended_alts":[],"probability":0}}';
      
      RawPoaRoc := T2DIntArrayToJson(MatrizPoaActiveInt);
      RawPoaProm := '[]';
      RawResRoc := T2DDoubleArrayToJson(ResultadoActive);
      RawResProm := '[]';
      
      SetLength(FilteredPerms, Length(ActiveFilteredPerms));
      for k := 0 to Length(ActiveFilteredPerms) - 1 do
        FilteredPerms[k] := ActiveFilteredPerms[k];
      CasesRocRaw := T2DIntArrayToJson(FilteredPerms);
      CasesPromRaw := '[]';
    end
    else
    begin
      PromPayload := Format(
        '{"totalCases":%d,"matrizSol":%s,"resultSol":%s,' +
        '"stats":{"media_dif_sol":%s,"max_dif_sol":%s,"min_dif_sol":%s,' +
        '"media_geral":%s,"maximo_geral":%s,"minimo_geral":%s,' +
        '"media_geral_naosol":%s,"maximo_geral_naosol":%s,"minimo_geral_naosol":%s,' +
        '"desvio_padrao_dif_sol":%s,"desvio_padrao_geral":%s},' +
        '"decisionRule":{"status":"%s","recommended_alts":%s,"probability":%s}}',
        [TotalCases,
         T2DIntArrayToJson(MatrizSol),
         IntArrayToJson(ResultSol),
         T2DDoubleArrayToJson(Stats.MediaDifSol),
         T2DDoubleArrayToJson(Stats.MaxDifSol),
         T2DDoubleArrayToJson(Stats.MinDifSol),
         DoubleArrayToJson(Stats.MediaGeral),
         DoubleArrayToJson(Stats.MaximoGeral),
         DoubleArrayToJson(Stats.MinimoGeral),
         DoubleArrayToJson(Stats.MediaGeralNaoSol),
         DoubleArrayToJson(Stats.MaximoGeralNaoSol),
         DoubleArrayToJson(Stats.MinimoGeralNaoSol),
         T2DDoubleArrayToJson(Stats.DesvioPadraoDifSol),
         DoubleArrayToJson(Stats.DesvioPadraoGeral),
         DecRules.Status,
         IntArrayToJson(DecRules.RecommendedAlts),
         FloatToStr(DecRules.Probability, fs_fmt)]
      );
      RocPayload := '{"totalCases":0,"matrizSol":[[]],"resultSol":[],"stats":{},"decisionRule":{"status":"N/A","recommended_alts":[],"probability":0}}';
      
      RawPoaRoc := '[]';
      RawPoaProm := T2DIntArrayToJson(MatrizPoaActiveInt);
      RawResRoc := '[]';
      RawResProm := T2DDoubleArrayToJson(ResultadoActive);
      
      SetLength(FilteredPerms, Length(ActiveFilteredPerms));
      for k := 0 to Length(ActiveFilteredPerms) - 1 do
        FilteredPerms[k] := ActiveFilteredPerms[k];
      CasesPromRaw := T2DIntArrayToJson(FilteredPerms);
      CasesRocRaw := '[]';
    end;

    // Output overall results JSON
    RespJson := Format(
      '{"success":true,"problemName":"%s","nomesAlt":%s,"nomesCrit":%s,"totalCases":%d,' +
      '"matrizConseq":%s,"matrizConseqNorm":%s,"tipoCrit":%s,"niveisCrit":%s,"rationality":"%s",' +
      '"holisticEvaluations":%s,"decompositionPreferences":%s,"decompositionQuestion":%s,"roc":%s,"promethee":%s,' +
      '"elicitation":{"altX":%d,"altZ":%d,"matrizProbX":%s,"matrizProbZ":%s,"matrizProbOutros":%s},' +
      '"raw":{"casesOrdemCritRoc":%s,"casesOrdemCritPromethee":%s,"resultadoRoc":%s,' +
      '"resultadoPromethee":%s,"matrizPoa":%s,"matrizPoaPromethee":%s}}',
      [GetStr(JsonObj, 'problemName', 'SPEAR Problem'),
       StringListToJson(nomeAlt),
       StringListToJson(nomeCrit),
       TotalCases,
       T2DDoubleArrayToJson(matrizConseq),
       T2DDoubleArrayToJson(MatrizConseqNorm),
       IntArrayToJson(tipoCrit),
       IntArrayToJson(niveisCrit),
       rationality,
       GetJsonValueStr(JsonObj, 'holisticEvaluations', '[]'),
       GetJsonValueStr(JsonObj, 'decompositionPreferences', '[]'),
       NextQJson,
       RocPayload,
       PromPayload,
       ElicData.AltX,
       ElicData.AltZ,
       T2DDoubleArrayToJson(ElicData.MatrizProbX),
       T2DDoubleArrayToJson(ElicData.MatrizProbZ),
       T2DDoubleArrayToJson(ElicData.MatrizProbOutros),
       CasesRocRaw,
       CasesPromRaw,
       RawResRoc,
       RawResProm,
       RawPoaRoc,
       RawPoaProm]
    );

  finally
    nomeCrit.Free;
    nomeAlt.Free;
    holisticAlt1.Free;
    holisticAlt2.Free;
    holisticRelation.Free;
    decompCritA.Free;
    decompCritB.Free;
    decompRelation.Free;
    JsonObj.Free;
  end;
end;

procedure RunSensitivityCore(const ReqJson: string; out RespJson: string);
var
  JsonObj: TJSONObject;
  nomeCrit, nomeAlt: TStringList;
  tipoCrit, niveisCrit, rankFilters: TIntArray;
  matrizConseq: T2DDoubleArray;
  rationality: string;
  holisticAlt1, holisticAlt2, holisticRelation: TStringList;
  holisticFictValue: TDoubleArray;
  decompCritA, decompCritB, decompRelation: TStringList;
  decompRatio: TDoubleArray;
  VariationsPct: TDoubleArray;
  SensRes: TSensitivityResult;
  numCrit, numAlt: Integer;
begin
  JsonObj := ParseJson(ReqJson);
  if JsonObj = nil then
  begin
    RespJson := '{"success":false,"error":"Invalid JSON"}';
    Exit;
  end;

  nomeCrit := TStringList.Create;
  nomeAlt := TStringList.Create;
  holisticAlt1 := TStringList.Create;
  holisticAlt2 := TStringList.Create;
  holisticRelation := TStringList.Create;
  decompCritA := TStringList.Create;
  decompCritB := TStringList.Create;
  decompRelation := TStringList.Create;

  try
    numCrit := GetInt(JsonObj, 'numCrit');
    numAlt := GetInt(JsonObj, 'numAlt');
    tipoCrit := GetIntArray(JsonObj, 'tipoCrit');
    if Length(tipoCrit) = 0 then
      tipoCrit := GetIntArray(JsonObj, 'criterionTypes');

    niveisCrit := GetIntArray(JsonObj, 'niveisCrit');
    if Length(niveisCrit) = 0 then
      niveisCrit := GetIntArray(JsonObj, 'levels');

    nomeCrit.Free;
    nomeCrit := GetStringArray(JsonObj, 'nomeCrit');
    if nomeCrit.Count = 0 then
    begin
      nomeCrit.Free;
      nomeCrit := GetStringArray(JsonObj, 'criteria');
    end;

    nomeAlt.Free;
    nomeAlt := GetStringArray(JsonObj, 'nomeAlt');
    if nomeAlt.Count = 0 then
    begin
      nomeAlt.Free;
      nomeAlt := GetStringArray(JsonObj, 'alternatives');
    end;

    matrizConseq := Get2DDoubleArray(JsonObj, 'matrizConseq');
    if Length(matrizConseq) = 0 then
      matrizConseq := Get2DDoubleArray(JsonObj, 'matrix');

    rationality := GetStr(JsonObj, 'rationality', 'compensatory');
    rankFilters := GetIntArray(JsonObj, 'rankFilters');
    VariationsPct := GetDoubleArray(JsonObj, 'variationsPct');
    
    GetHolisticEvaluations(JsonObj, holisticAlt1, holisticAlt2, holisticRelation, holisticFictValue);
    GetDecompositionPreferences(JsonObj, decompCritA, decompCritB, decompRelation, decompRatio);

    SensRes := RunSensitivityAnalysis(
      matrizConseq, tipoCrit, niveisCrit, rationality, rankFilters,
      holisticAlt1, holisticAlt2, holisticRelation, holisticFictValue,
      nomeAlt, nomeCrit, VariationsPct,
      decompCritA, decompCritB, decompRelation, decompRatio, 10000
    );

    RespJson := Format(
      '{"success":true,"alternatives":%s,"probabilities":%s,"deltas":%s,"min_crit":%s,"max_crit":%s}',
      [StringListToJson(SensRes.Alternatives),
       DoubleArrayToJson(SensRes.Probabilities),
       DoubleArrayToJson(SensRes.Deltas),
       DoubleArrayToJson(SensRes.MinCrit),
       DoubleArrayToJson(SensRes.MaxCrit)]
    );
    SensRes.Alternatives.Free;
  finally
    nomeCrit.Free;
    nomeAlt.Free;
    holisticAlt1.Free;
    holisticAlt2.Free;
    holisticRelation.Free;
    decompCritA.Free;
    decompCritB.Free;
    decompRelation.Free;
    JsonObj.Free;
  end;
end;

function LoadProblemCore(ProblemId: Integer; UserId: Integer; out LoadedJson: string): Boolean;
var
  Conn: TZConnection;
  Query: TZQuery;
  QueryTmp: TZQuery;
  ProblemName, rationality: string;
  nomeCrit, nomeAlt: TStringList;
  tipoCrit, niveisCrit, CritDbIds, AltDbIds: TIntArray;
  matrizConseq: T2DDoubleArray;
  HolisticJson, DecompJson, FictValStr: string;
  AltIdx, CritIdx, i, L_C, AltId, CritId, Idx1, Idx2: Integer;
  ValDouble: Double;
  fs_fmt: TFormatSettings;
begin
  Result := False;
  LoadedJson := '';
  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs_fmt);
  fs_fmt.DecimalSeparator := '.';

  if not IWServerController.GetDBConn(Conn, Query) then
    Exit;

  nomeCrit := TStringList.Create;
  nomeAlt := TStringList.Create;
  try
    Query.SQL.Text := 'SELECT id, nome_problema, racionalidade FROM problema WHERE id = :id AND ID_usuario = :UserId';
    Query.ParamByName('id').AsInteger := ProblemId;
    Query.ParamByName('UserId').AsInteger := UserId;
    Query.Open;

    if Query.Eof then Exit;

    ProblemName := Query.FieldByName('nome_problema').AsString;
    rationality := Query.FieldByName('racionalidade').AsString;
    if rationality = '' then rationality := 'compensatory';
    Query.Close;

    // Load Criteria
    Query.SQL.Text := 'SELECT id, nome_criterio, tipo_criterio, niveis FROM criterio WHERE ID_problema = :id ORDER BY id';
    Query.ParamByName('id').AsInteger := ProblemId;
    Query.Open;
    while not Query.Eof do
    begin
      nomeCrit.Add(Query.FieldByName('nome_criterio').AsString);
      L_C := nomeCrit.Count;
      SetLength(tipoCrit, L_C);
      SetLength(niveisCrit, L_C);
      tipoCrit[L_C-1] := Query.FieldByName('tipo_criterio').AsInteger;
      niveisCrit[L_C-1] := Query.FieldByName('niveis').AsInteger;
      Query.Next;
    end;
    Query.Close;

    // Load Alternatives
    Query.SQL.Text := 'SELECT id, nome_alternativa FROM alternativa WHERE ID_problema = :id ORDER BY id';
    Query.ParamByName('id').AsInteger := ProblemId;
    Query.Open;
    while not Query.Eof do
    begin
      nomeAlt.Add(Query.FieldByName('nome_alternativa').AsString);
      Query.Next;
    end;
    Query.Close;

    // Load Consequence Matrix values
    SetLength(matrizConseq, nomeAlt.Count, nomeCrit.Count);
    for AltIdx := 0 to nomeAlt.Count - 1 do
      for CritIdx := 0 to nomeCrit.Count - 1 do
        matrizConseq[AltIdx][CritIdx] := 0.0;

    Query.SQL.Text := 'SELECT ID_alternativa, ID_criterio, valor_performance FROM matrizconsequencia WHERE ID_problema = :id';
    Query.ParamByName('id').AsInteger := ProblemId;
    Query.Open;

    SetLength(CritDbIds, nomeCrit.Count);
    QueryTmp := TZQuery.Create(nil);
    QueryTmp.Connection := Conn;
    try
      QueryTmp.SQL.Text := 'SELECT id FROM criterio WHERE ID_problema = :id ORDER BY id';
      QueryTmp.ParamByName('id').AsInteger := ProblemId;
      QueryTmp.Open;
      i := 0;
      while not QueryTmp.Eof do
      begin
        CritDbIds[i] := QueryTmp.Fields[0].AsInteger;
        Inc(i);
        QueryTmp.Next;
      end;
    finally
      QueryTmp.Free;
    end;

    SetLength(AltDbIds, nomeAlt.Count);
    QueryTmp := TZQuery.Create(nil);
    QueryTmp.Connection := Conn;
    try
      QueryTmp.SQL.Text := 'SELECT id FROM alternativa WHERE ID_problema = :id ORDER BY id';
      QueryTmp.ParamByName('id').AsInteger := ProblemId;
      QueryTmp.Open;
      i := 0;
      while not QueryTmp.Eof do
      begin
        AltDbIds[i] := QueryTmp.Fields[0].AsInteger;
        Inc(i);
        QueryTmp.Next;
      end;
    finally
      QueryTmp.Free;
    end;

    while not Query.Eof do
    begin
      AltId := Query.FieldByName('ID_alternativa').AsInteger;
      CritId := Query.FieldByName('ID_criterio').AsInteger;
      ValDouble := Query.FieldByName('valor_performance').AsFloat;

      Idx1 := -1;
      for i := 0 to Length(AltDbIds) - 1 do
        if AltDbIds[i] = AltId then begin Idx1 := i; Break; end;

      Idx2 := -1;
      for i := 0 to Length(CritDbIds) - 1 do
        if CritDbIds[i] = CritId then begin Idx2 := i; Break; end;

      if (Idx1 <> -1) and (Idx2 <> -1) then
        matrizConseq[Idx1][Idx2] := ValDouble;
      Query.Next;
    end;
    Query.Close;

    // Load Holistic evaluations
    HolisticJson := '[';
    Query.SQL.Text := 'SELECT alt1_nome, alt2_nome, tipo_relacao, fictitious_value FROM avaliacaoholistica WHERE ID_problema = :id ORDER BY id';
    Query.ParamByName('id').AsInteger := ProblemId;
    Query.Open;
    i := 0;
    while not Query.Eof do
    begin
      if i > 0 then HolisticJson := HolisticJson + ',';
      FictValStr := 'null';
      if not Query.FieldByName('fictitious_value').IsNull then
        FictValStr := FloatToStr(Query.FieldByName('fictitious_value').AsFloat, fs_fmt);

      HolisticJson := HolisticJson + Format(
        '{"alt1":"%s","alt2":"%s","relation":"%s","fictitiousValue":%s}',
        [Query.FieldByName('alt1_nome').AsString,
         Query.FieldByName('alt2_nome').AsString,
         Query.FieldByName('tipo_relacao').AsString,
         FictValStr]
      );
      Inc(i);
      Query.Next;
    end;
    HolisticJson := HolisticJson + ']';
    Query.Close;

    // Load Decomposition preferences
    DecompJson := '[';
    Query.SQL.Text := 'SELECT criterio_a, criterio_b, tipo_relacao, valor_ratio FROM decomposicaopreferencia WHERE ID_problema = :id ORDER BY id';
    Query.ParamByName('id').AsInteger := ProblemId;
    Query.Open;
    i := 0;
    while not Query.Eof do
    begin
      if i > 0 then DecompJson := DecompJson + ',';
      DecompJson := DecompJson + Format(
        '{"critA":"%s","critB":"%s","relation":"%s","ratio":%s}',
        [Query.FieldByName('criterio_a').AsString,
         Query.FieldByName('criterio_b').AsString,
         Query.FieldByName('tipo_relacao').AsString,
         FloatToStr(Query.FieldByName('valor_ratio').AsFloat, fs_fmt)]
      );
      Inc(i);
      Query.Next;
    end;
    DecompJson := DecompJson + ']';
    Query.Close;

    LoadedJson := Format(
      '{"success":true,"problemId":%d,"problemName":"%s","rationality":"%s","criteria":%s,"criterionTypes":%s,"levels":%s,"alternatives":%s,"matrix":%s,"holisticEvaluations":%s,"decompositionPreferences":%s}',
      [ProblemId,
       ProblemName,
       rationality,
       StringListToJson(nomeCrit),
       IntArrayToJson(tipoCrit),
       IntArrayToJson(niveisCrit),
       StringListToJson(nomeAlt),
       T2DDoubleArrayToJson(matrizConseq),
       HolisticJson,
       DecompJson]
    );
    Result := True;
  finally
    nomeCrit.Free;
    nomeAlt.Free;
    Query.Free;
    Conn.Free;
  end;
end;

end.
