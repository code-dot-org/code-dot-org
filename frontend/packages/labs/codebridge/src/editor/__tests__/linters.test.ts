import {describe, expect, it} from 'vitest';

import {getHtmlLintDiagnostics, lintExtensionsFor} from '../linters';

describe('getHtmlLintDiagnostics', () => {
  it('reports an unclosed tag', () => {
    const diagnostics = getHtmlLintDiagnostics('<div><p>hello</div>');
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].message).toMatch(/tag/i);
  });

  it('reports an unquoted attribute value', () => {
    const diagnostics = getHtmlLintDiagnostics('<img src=cat.png />');
    expect(diagnostics.some(d => /double quotes/i.test(d.message))).toBe(true);
  });

  it('accepts well-formed html', () => {
    expect(
      getHtmlLintDiagnostics(
        '<!doctype html><html><body><p>hi</p></body></html>',
      ),
    ).toEqual([]);
  });

  it('points at the offending offset, not the start of the document', () => {
    const source = '<p>fine</p>\n<div><span>oops</div>';
    const [first] = getHtmlLintDiagnostics(source);
    // The problem is on the second line, so past the first line's newline.
    expect(first.from).toBeGreaterThan(source.indexOf('\n'));
  });
});

describe('lintExtensionsFor', () => {
  it('lints the languages we have linters for', () => {
    expect(lintExtensionsFor('javascript')).toHaveLength(1);
    expect(lintExtensionsFor('html')).toHaveLength(1);
  });

  it('leaves other languages alone', () => {
    // CSS linting is absent on purpose — see the note in linters.ts.
    expect(lintExtensionsFor('css')).toEqual([]);
    expect(lintExtensionsFor('python')).toEqual([]);
  });
});
