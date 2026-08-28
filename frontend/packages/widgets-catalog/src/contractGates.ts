/**
 * Host-owned checks against a widget's SERVED document (post
 * injectWidgetChrome — what the sandboxed iframe actually receives), not its
 * source. Applies identically to a built (esbuild) widget and a legacy
 * hand-written one: the contract is about the document, not how it was
 * produced.
 *
 * Deliberately static-only. What this does NOT catch, and a real
 * Playwright/axe-core pass against the rendered iframe would: computed
 * color contrast, actual focus order and visible focus rings, whether a
 * `role`/`aria-*` attribute is semantically correct (only that positive
 * tabindex and onclick-on-a-div are absent), screen-reader announcement
 * behavior, and whether McpApp calls happen at the RIGHT time (only that
 * the calls exist in source, not that they fire). These are static proxies
 * for a dynamic gate, not a replacement for one.
 */

export const MAX_WIDGET_DOC_BYTES = 1.5 * 1024 * 1024;

const NETWORK_PATTERNS: {label: string; pattern: RegExp}[] = [
  {label: 'fetch(', pattern: /\bfetch\s*\(/},
  {label: 'XMLHttpRequest', pattern: /\bXMLHttpRequest\b/},
  {label: 'new WebSocket(', pattern: /\bnew\s+WebSocket\s*\(/},
  // Deliberately NOT a bare `https?:\/\// scan: bundling react/component-
  // library unminified pulls in their own dev-mode warning text (e.g.
  // "https://reactjs.org/link/...") and license/homepage comments verbatim
  // — inert strings, never fetched, indistinguishable from a real
  // reference by a plain substring check. These three are the actual
  // resource-loading surfaces a browser would act on; data: URIs and CSS
  // var() references never match any of them.
  {
    label: 'src="http(s)://…"',
    pattern: /\bsrc\s*=\s*["']\s*https?:\/\//i,
  },
  {
    label: 'href="http(s)://…"',
    pattern: /\bhref\s*=\s*["']\s*https?:\/\//i,
  },
  {
    label: 'CSS url(http(s)://…)',
    pattern: /\burl\(\s*["']?\s*https?:\/\//i,
  },
  {
    label: '.src = "http(s)://…"',
    pattern: /\.src\s*=\s*["']\s*https?:\/\//i,
  },
];

// button/a/input/select/textarea/label are natively interactive (or, for
// label, forward activation to a control) and get their own keyboard
// handling for free; an onclick anywhere else needs a real interactive
// element instead, or it is invisible to keyboard/AT users.
const NATIVELY_INTERACTIVE_TAGS = new Set([
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'label',
]);
const TAG_WITH_ONCLICK = /<([a-z][a-z0-9]*)\b[^>]*?\sonclick\s*=/gi;
const POSITIVE_TABINDEX = /\btabindex\s*=\s*["']?\s*[1-9]/i;

/**
 * Returns a violation message per failed check, empty when the document
 * passes every gate. Byte length is measured the same way the browser and
 * the store do: UTF-8.
 */
export function checkWidgetDocument(html: string): string[] {
  const violations: string[] = [];

  for (const {label, pattern} of NETWORK_PATTERNS) {
    if (pattern.test(html)) {
      violations.push(`network reference found: ${label}`);
    }
  }

  // `McpApp\??\.\w+\(` (a CALL, not the bare identifier) is deliberate: the
  // injected shim's own definition (window.McpApp = {updateModelContext(...
  // {...}}) always contains the identifiers "McpApp" and
  // "updateModelContext" regardless of what the widget does, and the shim's
  // own source never writes `McpApp.<method>(` on itself — only a widget
  // that actually calls a method does. A bare-identifier check would pass
  // trivially on every document, built from the shim alone. The `\??`
  // allows `window.McpApp?.updateModelContext(...)` — optional chaining
  // against a shim that (pre-connect) may not be defined yet is normal,
  // defensive widget code, not a different call.
  if (!/McpApp\??\.\w+\s*\(/.test(html)) {
    violations.push('no McpApp.<method>() call found (shim present but unused)');
  }
  if (!/McpApp\??\.updateModelContext\s*\(/.test(html)) {
    violations.push('no McpApp.updateModelContext() call found');
  }

  const bytes = Buffer.byteLength(html, 'utf8');
  if (bytes >= MAX_WIDGET_DOC_BYTES) {
    violations.push(
      `document is ${bytes} bytes, at or over the ${MAX_WIDGET_DOC_BYTES} byte limit`,
    );
  }

  if (POSITIVE_TABINDEX.test(html)) {
    violations.push('positive tabindex found (tabindex must be 0 or -1)');
  }

  for (const match of html.matchAll(TAG_WITH_ONCLICK)) {
    const tag = match[1].toLowerCase();
    if (!NATIVELY_INTERACTIVE_TAGS.has(tag)) {
      violations.push(`onclick on non-interactive <${tag}>`);
    }
  }

  return violations;
}
