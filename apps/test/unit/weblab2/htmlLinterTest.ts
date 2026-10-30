import {getHtmlLintDiagnostics} from '@cdo/apps/weblab2/htmlLinter';

describe('htmlLinter', () => {
  it('reports attribute values without double quotes', () => {
    const diagnostics = getHtmlLintDiagnostics(
      '<!DOCTYPE html>\n<html>\n<body>\n<p class=pink>Pink text</p>\n</body>\n</html>'
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          message: expect.stringContaining('must be in double quotes'),
        }),
      ])
    );
  });

  it('reports unescaped special characters', () => {
    const diagnostics = getHtmlLintDiagnostics(
      '<!DOCTYPE html>\n<html>\n<body>\n2 < 3\n</body>\n</html>'
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          message: expect.stringContaining(
            'Special characters must be escaped'
          ),
        }),
      ])
    );
  });

  it('reports unpaired tags', () => {
    const diagnostics = getHtmlLintDiagnostics(
      '<!DOCTYPE html>\n<html>\n<body>\n<h1>Pink text</p>\n</body>\n</html>'
    );

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          message: expect.stringContaining('Tag must be paired'),
        }),
      ])
    );
  });

  it('does not report document completeness, casing, or duplicate attribute issues', () => {
    const diagnostics = getHtmlLintDiagnostics(
      '<HTML>\n<head></head>\n<body>\n<H1 id="x" id="x">Pink text</H1>\n<img SRC="">\n<p id="x">Duplicate id</p>\n</body>\n</HTML>'
    );

    expect(diagnostics).toHaveLength(0);
  });
});
