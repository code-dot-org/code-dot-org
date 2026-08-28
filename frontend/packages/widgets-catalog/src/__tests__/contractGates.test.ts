import {describe, expect, it} from 'vitest';

import {buildWidgetDocument} from '@code-dot-org/widget-runtime/chrome';

import {checkWidgetDocument, MAX_WIDGET_DOC_BYTES} from '../contractGates.js';

/** A document that passes every gate — the baseline every failure test mutates. */
function cleanDocument(bodyHtml: string, extraJs = ''): string {
  return buildWidgetDocument({
    title: 'Contract gate fixture',
    css: '.probe { color: var(--text-neutral-primary); }',
    bodyHtml,
    js: `
      McpApp.connect();
      McpApp.on('toolInput', () => {});
      document.getElementById('go').addEventListener('click', () => {
        McpApp.updateModelContext({structuredContent: {event: 'completed'}});
      });
      ${extraJs}
    `,
  });
}

describe('checkWidgetDocument', () => {
  it('passes a clean document', () => {
    const html = cleanDocument('<button id="go">Go</button>');
    expect(checkWidgetDocument(html)).toEqual([]);
  });

  it('flags fetch(', () => {
    const html = cleanDocument(
      '<button id="go">Go</button>',
      "fetch('/anything');",
    );
    expect(checkWidgetDocument(html)).toContain('network reference found: fetch(');
  });

  it('flags XMLHttpRequest', () => {
    const html = cleanDocument(
      '<button id="go">Go</button>',
      'new XMLHttpRequest();',
    );
    expect(checkWidgetDocument(html)).toContain(
      'network reference found: XMLHttpRequest',
    );
  });

  it('flags new WebSocket(', () => {
    const html = cleanDocument(
      '<button id="go">Go</button>',
      "new WebSocket('wss://example.com');",
    );
    expect(checkWidgetDocument(html)).toContain(
      'network reference found: new WebSocket(',
    );
  });

  it('flags an <img src="https://…">', () => {
    const html = cleanDocument('<img src="https://example.com/cat.png">');
    expect(checkWidgetDocument(html)).toContain(
      'network reference found: src="http(s)://…"',
    );
  });

  it('flags an <a href="https://…">', () => {
    const html = cleanDocument('<a href="https://example.com">go</a>');
    expect(checkWidgetDocument(html)).toContain(
      'network reference found: href="http(s)://…"',
    );
  });

  it('flags a CSS url(https://…)', () => {
    const html = cleanDocument(
      '<div class="probe">hi</div>',
      '',
    ).replace(
      '.probe { color: var(--text-neutral-primary); }',
      ".probe { background: url('https://example.com/bg.png'); }",
    );
    expect(checkWidgetDocument(html)).toContain(
      'network reference found: CSS url(http(s)://…)',
    );
  });

  it('flags a JS .src assignment to an http(s) URL', () => {
    const html = cleanDocument(
      '<button id="go">Go</button>',
      "const img = new Image(); img.src = 'https://example.com/x.png';",
    );
    expect(checkWidgetDocument(html)).toContain(
      'network reference found: .src = "http(s)://…"',
    );
  });

  it('does not flag help-link text inside bundled library warnings', () => {
    // Unminified react/component-library bundles carry their own dev-mode
    // warning text verbatim (e.g. "See https://reactjs.org/link/..."),
    // never wrapped in src=/href=/url() — inert text a browser never acts
    // on, and NODE_ENV=production (see buildWidget.ts) drops most of it
    // anyway. The gate must not flag prose containing a URL.
    const html = cleanDocument(
      '<button id="go">Go</button>',
      "console.warn('See https://reactjs.org/link/some-warning for details.');",
    );
    expect(
      checkWidgetDocument(html).some(v => v.includes('network reference')),
    ).toBe(false);
  });

  it('does not flag the CSP meta tag\'s http-equiv attribute', () => {
    // http-equiv contains "http" but not "http://" or "https://" — the CSP
    // tag buildWidgetDocument always injects must never trip this gate.
    const html = cleanDocument('<button id="go">Go</button>');
    expect(html).toContain('http-equiv');
    expect(
      checkWidgetDocument(html).some(v => v.includes('network reference')),
    ).toBe(false);
  });

  it('does not flag a data: URI', () => {
    const html = cleanDocument(
      '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">',
    );
    expect(checkWidgetDocument(html)).toEqual([]);
  });

  it('flags a document at or over the size budget', () => {
    const html = cleanDocument(
      `<div>${'x'.repeat(MAX_WIDGET_DOC_BYTES)}</div>`,
    );
    expect(
      checkWidgetDocument(html).some(v => v.includes('byte limit')),
    ).toBe(true);
  });

  it('passes a document comfortably under the size budget', () => {
    const html = cleanDocument('<button id="go">Go</button>');
    expect(Buffer.byteLength(html, 'utf8')).toBeLessThan(MAX_WIDGET_DOC_BYTES);
  });

  it('flags the shim being present but never called', () => {
    // buildWidgetDocument always injects the McpApp shim DEFINITION — the
    // gate must not pass on that alone.
    const html = buildWidgetDocument({
      title: 'Unused shim',
      css: '',
      bodyHtml: '<p>Static content, no interaction.</p>',
      js: '',
    });
    expect(html).toContain('window.McpApp = {');
    expect(
      checkWidgetDocument(html).some(v => v.includes('McpApp.<method>')),
    ).toBe(true);
  });

  it('flags McpApp usage that never reports a model-context update', () => {
    const connectOnly = buildWidgetDocument({
      title: 'Connect only',
      css: '',
      bodyHtml: '<p>hi</p>',
      js: 'McpApp.connect(); McpApp.reportSize();',
    });
    expect(checkWidgetDocument(connectOnly)).toContain(
      'no McpApp.updateModelContext() call found',
    );
  });

  it('accepts optional-chained McpApp calls (window.McpApp?.updateModelContext(...))', () => {
    // Defensive real-world style: the shim may not be defined yet at the
    // point a widget's own code runs, so `McpApp?.foo(...)` is normal, not
    // a different call than `McpApp.foo(...)`.
    const html = buildWidgetDocument({
      title: 'Optional chaining',
      css: '',
      bodyHtml: '<button id="go">Go</button>',
      js: "window.McpApp?.connect(); window.McpApp?.updateModelContext({structuredContent: {event: 'completed'}});",
    });
    expect(checkWidgetDocument(html)).toEqual([]);
  });

  it('flags a positive tabindex', () => {
    const html = cleanDocument('<div tabindex="1">nope</div>');
    expect(checkWidgetDocument(html)).toContain(
      'positive tabindex found (tabindex must be 0 or -1)',
    );
  });

  it('does not flag tabindex 0 or -1', () => {
    const html = cleanDocument(
      '<div tabindex="0">ok</div><div tabindex="-1">also ok</div>',
    );
    expect(
      checkWidgetDocument(html).some(v => v.includes('tabindex')),
    ).toBe(false);
  });

  it('flags onclick on a non-interactive element', () => {
    const html = cleanDocument('<div onclick="doThing()">click me</div>');
    expect(checkWidgetDocument(html)).toContain(
      'onclick on non-interactive <div>',
    );
  });

  it('does not flag onclick on a real button', () => {
    const html = cleanDocument('<button onclick="doThing()">click me</button>');
    expect(
      checkWidgetDocument(html).some(v => v.includes('onclick')),
    ).toBe(false);
  });
});

// A regression check against the live authoring-service dev session (scanning
// frontend/.authoring/sessions/*/widgets for real widget.html files) lives in
// authoring-service's own test suite, not here — this package has no notion
// of a session store, and CI never has .authoring/ data either.
