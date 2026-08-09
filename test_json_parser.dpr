program test_json_parser;

{$APPTYPE CONSOLE}

uses
  SysUtils, DBXJSON;

procedure Test(const LabelStr, JsonStr: string);
var
  Val: TJSONValue;
  Bytes: TBytes;
begin
  WriteLn('--- Testing: ' + LabelStr + ' ---');
  try
    Bytes := TEncoding.UTF8.GetBytes(JsonStr);
    Val := TJSONObject.ParseJSONValue(Bytes, 0);
    if Val <> nil then
    begin
      WriteLn('UTF8 parsed successfully! Class: ' + Val.ClassName);
      Val.Free;
    end
    else
      WriteLn('UTF8 parsed to nil.');
  except
    on E: Exception do WriteLn('UTF8 Exception: ' + E.Message);
  end;

  try
    Bytes := TEncoding.Unicode.GetBytes(JsonStr);
    Val := TJSONObject.ParseJSONValue(Bytes, 0);
    if Val <> nil then
    begin
      WriteLn('Unicode parsed successfully! Class: ' + Val.ClassName);
      Val.Free;
    end
    else
      WriteLn('Unicode parsed to nil.');
  except
    on E: Exception do WriteLn('Unicode Exception: ' + E.Message);
  end;
end;

begin
  Test('Simple Object', '{"a":1}');
  Test('Simple Object with space', '{"a": 1}');
  Test('Object with Array of Int, no space', '{"a":[1,2,3]}');
  Test('Object with Empty Array, no space', '{"a":[]}');
  Test('Object with Nested Array, no space', '{"a":[[1,2],[3,4]]}');
  Test('Object with Float, no space', '{"a":1.5}');
  Test('Object with Null, no space', '{"a":null}');
  Test('Object with Double Array, no space', '{"a":[1.0,2.0,3.0]}');
  Test('Our Problem Payload', '{"problemName": "Test Problem", "rationality": "compensatory", "numCrit": 3, "numAlt": 3,' +
    '"nomeCrit": ["Cost", "Quality", "Delivery"], "tipoCrit": [0, 1, 1], "niveisCrit": [3, 5, 3],' +
    '"nomeAlt": ["Alt A", "Alt B", "Alt C"], "matrizConseq": [[2.0, 4.0, 2.0], [1.0, 3.0, 3.0], [3.0, 5.0, 1.0]],' +
    '"rankFilters": [-1, -1, -1], "holisticEvaluations": [], "decompositionPreferences": [], "excludedPairs": []}');
end.
