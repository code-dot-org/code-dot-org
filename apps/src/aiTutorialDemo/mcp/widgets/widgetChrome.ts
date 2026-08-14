import {WIDGET_APP_SHIM_JS} from './appShim';

// Widgets must be self-contained documents: the host renders them in a
// sandboxed iframe with a CSP that blocks all network fetches, so styles and
// scripts are inlined and fonts fall back to the system stack. The shared
// styles below approximate the design system's look (Figtree metrics via
// system-ui, neutral grays, teal accent) without loading brand assets.
const WIDGET_BASE_CSS = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 16px;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 14px;
    color: #292f36;
    background: #ffffff;
  }
  h2 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
  }
  button.primary {
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    background: #0093a4;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  button.primary:hover:not(:disabled) { background: #007786; }
  button.primary:disabled { background: #c6cacd; cursor: default; }
  .sent-note {
    margin-top: 8px;
    font-size: 12px;
    color: #56626b;
  }
`;

/**
 * Wraps widget-specific markup, style, and script into a complete MCP App
 * document. The CSP meta tag enforces self-containment even if the host's
 * iframe sandboxing were misconfigured: no network, no navigation.
 */
export function buildWidgetDocument(options: {
  title: string;
  css: string;
  bodyHtml: string;
  js: string;
  /**
   * Permits eval/new Function inside the widget. Only for widgets whose job
   * is running student code; the network stays blocked either way.
   */
  allowEval?: boolean;
}): string {
  const scriptSrc = options.allowEval
    ? "'unsafe-inline' 'unsafe-eval'"
    : "'unsafe-inline'";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy"
  content="default-src 'none'; style-src 'unsafe-inline'; script-src ${scriptSrc}; img-src data:;">
<title>${options.title}</title>
<style>${WIDGET_BASE_CSS}</style>
<style>${options.css}</style>
</head>
<body>
${options.bodyHtml}
<script>${WIDGET_APP_SHIM_JS}</script>
<script>${options.js}</script>
</body>
</html>`;
}
