unit uExcelImport;

interface

uses
  Classes, SysUtils, ComObj, Variants, Math, uTypes;

type
  TImportedData = record
    Success: Boolean;
    ErrorMsg: string;
    Criteria: TStringList;
    CriterionTypes: TIntArray;
    Levels: TIntArray;
    Alternatives: TStringList;
    Matrix: T2DDoubleArray;
  end;

function ImportFromCSV(const FilePath: string): TImportedData;
function ImportFromExcel(const FilePath: string): TImportedData;
function ImportFile(const FilePath: string): TImportedData;

implementation

function SplitCSVLine(const Line: string; Delimiter: Char): TStringList;
var
  i: Integer;
  InQuotes: Boolean;
  CurrentField: string;
  C: Char;
begin
  Result := TStringList.Create;
  InQuotes := False;
  CurrentField := '';
  for i := 1 to Length(Line) do
  begin
    C := Line[i];
    if C = '"' then
      InQuotes := not InQuotes
    else if (C = Delimiter) and not InQuotes then
    begin
      Result.Add(Trim(CurrentField));
      CurrentField := '';
    end
    else
      CurrentField := CurrentField + C;
  end;
  Result.Add(Trim(CurrentField));
end;

function DetectDelimiter(const SampleLine: string): Char;
var
  i, CommaCount, SemicolonCount: Integer;
begin
  CommaCount := 0;
  SemicolonCount := 0;
  for i := 1 to Length(SampleLine) do
  begin
    if SampleLine[i] = ',' then
      Inc(CommaCount)
    else if SampleLine[i] = ';' then
      Inc(SemicolonCount);
  end;
  if SemicolonCount > CommaCount then
    Result := ';'
  else
    Result := ',';
end;

function ImportFromCSV(const FilePath: string): TImportedData;
var
  SL: TStringList;
  Delimiter: Char;
  i, j, RowIdx: Integer;
  RowFields: TStringList;
  CritCount: Integer;
  ValStr: string;
  ValDouble: Double;
  fs: TFormatSettings;
begin
  Result.Success := False;
  Result.ErrorMsg := '';
  Result.Criteria := TStringList.Create;
  Result.Alternatives := TStringList.Create;
  SetLength(Result.CriterionTypes, 0);
  SetLength(Result.Levels, 0);
  SetLength(Result.Matrix, 0);

  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs);
  fs.DecimalSeparator := '.';
  
  if not FileExists(FilePath) then
  begin
    Result.ErrorMsg := 'File not found.';
    Result.Criteria.Free;
    Result.Criteria := nil;
    Result.Alternatives.Free;
    Result.Alternatives := nil;
    Exit;
  end;

  SL := TStringList.Create;
  try
    try
      SL.LoadFromFile(FilePath, TEncoding.UTF8);
      if SL.Count < 2 then
        raise Exception.Create('Invalid CSV file format (too few rows).');

      Delimiter := DetectDelimiter(SL[0]);

      RowFields := SplitCSVLine(SL[0], Delimiter);
      try
        for i := 1 to RowFields.Count - 1 do
        begin
          if RowFields[i] <> '' then
            Result.Criteria.Add(RowFields[i]);
        end;
      finally
        RowFields.Free;
      end;

      CritCount := Result.Criteria.Count;
      if CritCount = 0 then
        raise Exception.Create('No criteria found in first row.');

      SetLength(Result.CriterionTypes, CritCount);
      SetLength(Result.Levels, CritCount);

      RowFields := SplitCSVLine(SL[1], Delimiter);
      try
        for i := 0 to CritCount - 1 do
        begin
          if (i + 1 < RowFields.Count) and (RowFields[i + 1] <> '') then
            Result.CriterionTypes[i] := StrToIntDef(RowFields[i + 1], 0)
          else
            Result.CriterionTypes[i] := 0;
        end;
      finally
        RowFields.Free;
      end;

      if SL.Count > 6 then
      begin
        RowFields := SplitCSVLine(SL[6], Delimiter);
        try
          for i := 0 to CritCount - 1 do
          begin
            if (Result.CriterionTypes[i] = 2) or (Result.CriterionTypes[i] = 3) then
            begin
              if (i + 1 < RowFields.Count) and (RowFields[i + 1] <> '') then
                Result.Levels[i] := StrToIntDef(RowFields[i + 1], 0)
              else
                Result.Levels[i] := 0;
            end
            else
              Result.Levels[i] := 0;
          end;
        finally
          RowFields.Free;
        end;
      end
      else
      begin
        for i := 0 to CritCount - 1 do
          Result.Levels[i] := 0;
      end;

      RowIdx := 8;
      while RowIdx < SL.Count do
      begin
        RowFields := SplitCSVLine(SL[RowIdx], Delimiter);
        try
          if (RowFields.Count > 0) and (RowFields[0] <> '') then
          begin
            Result.Alternatives.Add(RowFields[0]);
            SetLength(Result.Matrix, Result.Alternatives.Count);
            SetLength(Result.Matrix[Result.Alternatives.Count - 1], CritCount);
            
            for j := 0 to CritCount - 1 do
            begin
              if j + 1 < RowFields.Count then
              begin
                ValStr := RowFields[j + 1];
                ValStr := StringReplace(ValStr, ',', '.', [rfReplaceAll]);
                ValDouble := StrToFloatDef(ValStr, 0.0, fs);
                Result.Matrix[Result.Alternatives.Count - 1][j] := ValDouble;
              end
              else
                Result.Matrix[Result.Alternatives.Count - 1][j] := 0.0;
            end;
          end;
        finally
          RowFields.Free;
        end;
        Inc(RowIdx);
      end;

      Result.Success := True;
    except
      on E: Exception do
      begin
        Result.Success := False;
        Result.ErrorMsg := E.Message;
        Result.Criteria.Free;
        Result.Criteria := nil;
        Result.Alternatives.Free;
        Result.Alternatives := nil;
      end;
    end;
  finally
    SL.Free;
  end;
end;

function ImportFromExcel(const FilePath: string): TImportedData;
var
  ExcelApp: OLEVariant;
  Workbook: OLEVariant;
  Sheet: OLEVariant;
  Col, RowIdx, CritCount, i: Integer;
  Val: Variant;
  ValStr: string;
  ValDouble: Double;
  fs: TFormatSettings;
begin
  Result.Success := False;
  Result.ErrorMsg := '';
  Result.Criteria := TStringList.Create;
  Result.Alternatives := TStringList.Create;
  SetLength(Result.CriterionTypes, 0);
  SetLength(Result.Levels, 0);
  SetLength(Result.Matrix, 0);

  GetLocaleFormatSettings(SysLocale.DefaultLCID, fs);
  fs.DecimalSeparator := '.';

  try
    ExcelApp := CreateOleObject('Excel.Application');
  except
    Result.ErrorMsg := 'Microsoft Excel is not installed or could not be started.';
    Result.Criteria.Free;
    Result.Criteria := nil;
    Result.Alternatives.Free;
    Result.Alternatives := nil;
    Exit;
  end;

  try
    try
      ExcelApp.DisplayAlerts := False;
      Workbook := ExcelApp.Workbooks.Open(FilePath);
      Sheet := Workbook.ActiveSheet;

      Col := 2;
      while True do
      begin
        Val := Sheet.Cells[1, Col].Value;
        if VarIsEmpty(Val) or VarIsNull(Val) or (VarToStr(Val) = '') then
          Break;
        Result.Criteria.Add(VarToStr(Val));
        Inc(Col);
      end;

      CritCount := Result.Criteria.Count;
      if CritCount = 0 then
        raise Exception.Create('No criteria found in Excel sheet.');

      SetLength(Result.CriterionTypes, CritCount);
      SetLength(Result.Levels, CritCount);

      for i := 0 to CritCount - 1 do
      begin
        Val := Sheet.Cells[2, 2 + i].Value;
        Result.CriterionTypes[i] := StrToIntDef(VarToStr(Val), 0);
      end;

      for i := 0 to CritCount - 1 do
      begin
        Val := Sheet.Cells[7, 2 + i].Value;
        Result.Levels[i] := StrToIntDef(VarToStr(Val), 0);
      end;

      RowIdx := 9;
      while True do
      begin
        Val := Sheet.Cells[RowIdx, 1].Value;
        if VarIsEmpty(Val) or VarIsNull(Val) or (VarToStr(Val) = '') then
          Break;

        Result.Alternatives.Add(VarToStr(Val));
        SetLength(Result.Matrix, Result.Alternatives.Count);
        SetLength(Result.Matrix[Result.Alternatives.Count - 1], CritCount);

        for i := 0 to CritCount - 1 do
        begin
          Val := Sheet.Cells[RowIdx, 2 + i].Value;
          ValStr := VarToStr(Val);
          ValStr := StringReplace(ValStr, ',', '.', [rfReplaceAll]);
          ValDouble := StrToFloatDef(ValStr, 0.0, fs);
          Result.Matrix[Result.Alternatives.Count - 1][i] := ValDouble;
        end;
        Inc(RowIdx);
      end;

      Workbook.Close(False);
      Result.Success := True;
    except
      on E: Exception do
      begin
        Result.Success := False;
        Result.ErrorMsg := E.Message;
        Result.Criteria.Free;
        Result.Criteria := nil;
        Result.Alternatives.Free;
        Result.Alternatives := nil;
        try
          Workbook.Close(False);
        except
        end;
      end;
    end;
  finally
    try
      ExcelApp.Quit;
    except
    end;
  end;
end;

function ImportFile(const FilePath: string): TImportedData;
var
  Ext: string;
begin
  Ext := LowerCase(ExtractFileExt(FilePath));
  if Ext = '.csv' then
    Result := ImportFromCSV(FilePath)
  else if (Ext = '.xlsx') or (Ext = '.xls') then
    Result := ImportFromExcel(FilePath)
  else
  begin
    Result.Success := False;
    Result.ErrorMsg := 'Unsupported file format.';
    Result.Criteria := TStringList.Create;
    Result.Alternatives := TStringList.Create;
  end;
end;

end.
