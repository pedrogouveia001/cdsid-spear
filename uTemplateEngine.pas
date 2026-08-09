unit uTemplateEngine;

interface

uses
  Classes, SysUtils, StrUtils;

function RenderTemplate(
  const TemplateName: string;
  const UserEmail: string;
  const ErrorMsg: string = '';
  const NextUrl: string = ''
): string;

implementation

function LoadFileToString(const FilePath: string): string;
var
  SL: TStringList;
begin
  Result := '';
  if FileExists(FilePath) then
  begin
    SL := TStringList.Create;
    try
      SL.LoadFromFile(FilePath, TEncoding.UTF8);
      Result := SL.Text;
    finally
      SL.Free;
    end;
  end;
end;

function ExtractBlock(const Html, BlockName: string; out BlockContent: string): Boolean;
var
  StartTag, EndTag: string;
  StartPos, EndPos: Integer;
begin
  Result := False;
  BlockContent := '';
  StartTag := '{% block ' + BlockName + ' %}';
  EndTag := '{% endblock %}';

  StartPos := Pos(StartTag, Html);
  if StartPos > 0 then
  begin
    Inc(StartPos, Length(StartTag));
    EndPos := PosEx(EndTag, Html, StartPos);
    if EndPos > 0 then
    begin
      BlockContent := Copy(Html, StartPos, EndPos - StartPos);
      Result := True;
    end;
  end;
end;

function ReplaceBlockInBase(const BaseHtml, BlockName, Replacement: string; HasReplacement: Boolean): string;
var
  StartTag, EndTag: string;
  StartPos, EndPos: Integer;
begin
  Result := BaseHtml;
  StartTag := '{% block ' + BlockName + ' %}';
  EndTag := '{% endblock %}';

  StartPos := Pos(StartTag, Result);
  if StartPos > 0 then
  begin
    EndPos := PosEx(EndTag, Result, StartPos + Length(StartTag));
    if EndPos > 0 then
    begin
      if HasReplacement then
      begin
        Delete(Result, StartPos, EndPos + Length(EndTag) - StartPos);
        Insert(Replacement, Result, StartPos);
      end
      else
      begin
        Delete(Result, EndPos, Length(EndTag));
        Delete(Result, StartPos, Length(StartTag));
      end;
    end;
  end;
end;

function ProcessConditional(var Html: string; const ConditionVar: string; ConditionActive: Boolean; const ReplaceVarName: string = ''; const ReplaceValue: string = ''): string;
var
  StartTag, EndTag: string;
  StartPos, EndPos: Integer;
  BlockContent: string;
begin
  StartTag := '{% if ' + ConditionVar + ' %}';
  EndTag := '{% endif %}';

  while True do
  begin
    StartPos := Pos(StartTag, Html);
    if StartPos = 0 then
      Break;

    EndPos := PosEx(EndTag, Html, StartPos + Length(StartTag));
    if EndPos = 0 then
      Break;

    if ConditionActive then
    begin
      BlockContent := Copy(Html, StartPos + Length(StartTag), EndPos - (StartPos + Length(StartTag)));
      if ReplaceVarName <> '' then
        BlockContent := StringReplace(BlockContent, ReplaceVarName, ReplaceValue, [rfReplaceAll]);
      
      Delete(Html, StartPos, EndPos + Length(EndTag) - StartPos);
      Insert(BlockContent, Html, StartPos);
    end
    else
    begin
      Delete(Html, StartPos, EndPos + Length(EndTag) - StartPos);
    end;
  end;
  Result := Html;
end;

function RenderTemplate(
  const TemplateName: string;
  const UserEmail: string;
  const ErrorMsg: string = '';
  const NextUrl: string = ''
): string;
var
  AppPath, BasePath, TemplatePath: string;
  BaseHtml, PageHtml: string;
  HeadBlock, BackLinkBlock, ContentBlock, ScriptsBlock: string;
  HasHead, HasBackLink, HasContent, HasScripts: Boolean;
  RandomVal: Integer;
  PosStatic, StartPos, EndPos: Integer;
  Filename, FullTag: string;
begin
  AppPath := ExtractFilePath(ParamStr(0));
  BasePath := AppPath + 'templates' + PathDelim + 'base.html';
  TemplatePath := AppPath + 'templates' + PathDelim + TemplateName;

  BaseHtml := LoadFileToString(BasePath);
  if BaseHtml = '' then
  begin
    Result := 'Error: base.html not found at ' + BasePath;
    Exit;
  end;

  PageHtml := LoadFileToString(TemplatePath);
  if PageHtml = '' then
  begin
    Result := 'Error: template ' + TemplateName + ' not found at ' + TemplatePath;
    Exit;
  end;

  HasHead := ExtractBlock(PageHtml, 'head', HeadBlock);
  HasBackLink := ExtractBlock(PageHtml, 'back_link', BackLinkBlock);
  HasContent := ExtractBlock(PageHtml, 'content', ContentBlock);
  HasScripts := ExtractBlock(PageHtml, 'scripts', ScriptsBlock);

  BaseHtml := ReplaceBlockInBase(BaseHtml, 'head', HeadBlock, HasHead);
  BaseHtml := ReplaceBlockInBase(BaseHtml, 'back_link', BackLinkBlock, HasBackLink);
  BaseHtml := ReplaceBlockInBase(BaseHtml, 'content', ContentBlock, HasContent);
  BaseHtml := ReplaceBlockInBase(BaseHtml, 'scripts', ScriptsBlock, HasScripts);

  while True do
  begin
    PosStatic := Pos('{{ url_for(''static'', filename=''', BaseHtml);
    if PosStatic = 0 then
      Break;
    StartPos := PosStatic + Length('{{ url_for(''static'', filename=''');
    EndPos := PosEx('''', BaseHtml, StartPos);
    if EndPos = 0 then
      Break;
    Filename := Copy(BaseHtml, StartPos, EndPos - StartPos);
    
    FullTag := '{{ url_for(''static'', filename=''' + Filename + ''') }}';
    BaseHtml := StringReplace(BaseHtml, FullTag, '/static/' + Filename, [rfReplaceAll]);
  end;

  RandomVal := Random(99999) + 1;
  BaseHtml := StringReplace(BaseHtml, '{{ range(1, 100000) | random }}', IntToStr(RandomVal), [rfReplaceAll]);

  ProcessConditional(BaseHtml, 'session.get(''user_email'')', UserEmail <> '', '{{ session.get(''user_email'') }}', UserEmail);
  ProcessConditional(BaseHtml, 'error', ErrorMsg <> '', '{{ error }}', ErrorMsg);
  ProcessConditional(BaseHtml, 'next', NextUrl <> '', '{{ next }}', NextUrl);

  Result := BaseHtml;
end;

end.
