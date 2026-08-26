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

// The shim's DEFINITION, not a mere reference: agent-authored widgets often
// guard on `if (window.McpApp)` without the shim being present, and treating
// any mention as "already chromed" once skipped both the shim AND the CSP —
// leaving a widget with no network lockdown. Detect what actually matters.
const SHIM_DEFINITION_MARKER = 'window.McpApp = {';

// Matches a whole <meta http-equiv="Content-Security-Policy" ...> tag, its
// own line's leading indentation and trailing newline included, case-
// insensitively, however the widget quoted or spaced it. A widget can carry
// the literal marker text in a comment, or ship its own permissive policy
// (`default-src *`); either way its CSP is not trustworthy, so every such
// tag is stripped before our own is injected. Consuming the surrounding
// whitespace (not just the tag) keeps repeated strip-then-reinject passes at
// a stable fixed point instead of accumulating a blank line per pass. Global:
// a widget document can (rarely) carry more than one.
const WIDGET_CSP_META_TAG =
  /[ \t]*<meta\s+http-equiv\s*=\s*["']?Content-Security-Policy["']?[^>]*>[ \t]*\r?\n?/gi;

/**
 * Patches the MCP Apps CSP and postMessage shim into an already-complete
 * HTML document — the case where an authoring agent wrote the whole page
 * itself rather than handing buildWidgetDocument its pieces. A dumb string
 * transform on purpose: this has to run in the Node authoring service too,
 * where there is no DOM to parse with.
 *
 * The CSP is never trusted from the widget: any `<meta http-equiv=
 * "Content-Security-Policy">` tag the document carries is stripped — a
 * substring check alone is not enough, since a widget can put the marker
 * text in an HTML comment (so the check "sees" a CSP that was never applied)
 * or ship a permissive policy of its own (e.g. `default-src *`) that would
 * defeat the lockdown if merely left in place. Our own `default-src 'none'`
 * policy is then always injected. The shim is still only added when missing.
 */
// Only a leading doctype may precede our injected head. Matches optional
// leading whitespace so a document that opens with `\n<!doctype html>` is
// still recognized. Nothing else in the document is a valid anchor.
const LEADING_DOCTYPE = /^\s*<!doctype[^>]*>/i;

// Marks the head this function injects, so a later pass strips the WHOLE block
// (head tags, our meta, our shim) and reinjects rather than leaving an empty
// head behind — that keeps repeated serve/publish-time passes at a fixed
// point. A widget that ships this exact attribute only gets its own content
// stripped, never a bypass: the generic CSP strip below still removes any meta
// it left elsewhere.
const CHROME_HEAD_MARKER = 'data-cdo-widget-chrome';
const CHROME_HEAD_BLOCK =
  /\n?<head data-cdo-widget-chrome>[\s\S]*?<\/head>/gi;

export function injectWidgetChrome(html: string): string {
  // Remove any prior injected chrome, then any widget-supplied CSP meta. After
  // this, the document carries no CSP we would trust.
  const stripped = html
    .replace(CHROME_HEAD_BLOCK, '')
    .replace(WIDGET_CSP_META_TAG, '');

  const parts: string[] = [cspMetaTag()];
  if (!stripped.includes(SHIM_DEFINITION_MARKER)) {
    parts.push(`<script>${WIDGET_APP_SHIM_JS}</script>`);
  }
  // Our chrome IS a complete <head> placed at the very start of the document
  // (after any doctype), never spliced into the widget's own <head>. The CSP
  // must reach the parser before any widget script runs, and — this is the
  // security-critical part — the injection point must not be selectable by the
  // widget's own markup. Hunting for a `<head>` substring let a widget hide a
  // decoy `<head>` in a comment or attribute value, so our meta landed in an
  // inert position and the network lockdown silently vanished. Anchoring only
  // on the leading doctype removes every widget-controlled injection point: a
  // browser keeps the first <head> it parses, so ours wins regardless of what
  // the widget declares later.
  const head = `<head ${CHROME_HEAD_MARKER}>\n${parts.join('\n')}\n</head>`;

  const doctype = stripped.match(LEADING_DOCTYPE);
  if (doctype) {
    const at = doctype.index! + doctype[0].length;
    return `${stripped.slice(0, at)}\n${head}${stripped.slice(at)}`;
  }
  return `<!doctype html>\n${head}\n${stripped}`;
}
