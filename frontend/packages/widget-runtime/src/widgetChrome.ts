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
  /* Provider branding: title on the left, the widget vendor's mark on the
     right. Each widget colors .brand itself — it ships with the widget,
     underscoring that every widget can come from a different provider. */
  .widget-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  .brand {
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.02em;
    white-space: nowrap;
    flex-shrink: 0;
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

function cspMetaTag(allowEval?: boolean): string {
  const scriptSrc = allowEval
    ? "'unsafe-inline' 'unsafe-eval'"
    : "'unsafe-inline'";
  return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src ${scriptSrc}; img-src data:;">`;
}

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
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${cspMetaTag(options.allowEval)}
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

// Marker the shim installs on window; also the giveaway that a document
// already speaks the MCP Apps protocol and doesn't need chrome injected.
const SHIM_MARKER = 'window.McpApp';

/**
 * Patches the MCP Apps CSP and postMessage shim into an already-complete
 * HTML document — the case where an authoring agent wrote the whole page
 * itself rather than handing buildWidgetDocument its pieces. A dumb string
 * transform on purpose: this has to run in the Node authoring service too,
 * where there is no DOM to parse with.
 */
export function injectWidgetChrome(html: string): string {
  if (html.includes(SHIM_MARKER)) {
    return html;
  }

  const injection = `${cspMetaTag()}\n<script>${WIDGET_APP_SHIM_JS}</script>`;

  const headOpen = html.match(/<head[^>]*>/i);
  if (headOpen) {
    const at = headOpen.index! + headOpen[0].length;
    return html.slice(0, at) + '\n' + injection + html.slice(at);
  }

  const htmlOpen = html.match(/<html[^>]*>/i);
  if (htmlOpen) {
    const at = htmlOpen.index! + htmlOpen[0].length;
    return `${html.slice(0, at)}\n<head>${injection}</head>${html.slice(at)}`;
  }

  // No <html> tag at all: treat the input as a body fragment.
  return `<!doctype html>\n<html lang="en">\n<head>${injection}</head>\n<body>\n${html}\n</body>\n</html>`;
}
