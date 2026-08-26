import {describe, expect, it} from 'vitest';

import {buildWidgetDocument, injectWidgetChrome} from '../widgetChrome';

const CSP = 'http-equiv="Content-Security-Policy"';
const SHIM_DEFINITION = 'window.McpApp = {';

describe('injectWidgetChrome', () => {
  it('injects CSP and shim into a document that merely REFERENCES McpApp', () => {
    // Agent-authored widgets are told to call window.McpApp, never define it.
    // A reference must not be mistaken for the shim being present — that
    // mistake once shipped widgets with no CSP at all.
    const source =
      '<!doctype html><html><head><title>w</title></head>' +
      '<body><script>if (window.McpApp) { window.McpApp.connect(); }</script></body></html>';
    const out = injectWidgetChrome(source);
    expect(out).toContain(CSP);
    expect(out).toContain(SHIM_DEFINITION);
  });

  it('is idempotent on an already-chromed document', () => {
    const built = buildWidgetDocument({
      title: 'w',
      bodyHtml: '<p>hi</p>',
      css: '',
      js: '',
    });
    expect(injectWidgetChrome(built)).toBe(built);
  });

  it('adds only the missing piece when one is present', () => {
    const cspOnly =
      `<!doctype html><html><head><meta ${CSP} content="default-src 'none'"></head>` +
      '<body></body></html>';
    const out = injectWidgetChrome(cspOnly);
    expect(out).toContain(SHIM_DEFINITION);
    expect(out.match(/Content-Security-Policy/g)).toHaveLength(1);
  });

  it('wraps a bare fragment into a full chromed document', () => {
    const out = injectWidgetChrome('<p>fragment</p>');
    expect(out).toContain('<!doctype html>');
    expect(out).toContain(CSP);
    expect(out).toContain(SHIM_DEFINITION);
    expect(out).toContain('<p>fragment</p>');
  });
});
