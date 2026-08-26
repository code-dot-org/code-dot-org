// Design-system brand kit injected into every widget document. Widgets run
// network-less in a sandboxed iframe (CSP default-src 'none'), so this is a
// static, self-contained CSS string — no @font-face, no external requests.
//
// Token values are the resolved LIGHT-theme values from
// component-library-styles/colors.css and primitiveColors.css, inlined as
// plain hex rather than re-deriving through the primitive layer: widgets get
// one flat token surface, and the whole kit stays well under the size budget.
// Only the tokens .w-* primitives (and a widget author styling by hand) are
// likely to reach for are included — this is a curated subset, not a mirror
// of colors.css.
//
// Font stack: component-library-styles ships 'Figtree' plus a long CJK/RTL
// Noto Sans fallback chain. None of those files can load here (no network),
// so shipping the full stack is dead weight — 'Figtree' never resolves and
// every Noto Sans name is skipped in turn. This trims to the DS's primary
// family name (kept first so a host page that *does* have Figtree loaded,
// e.g. via an ancestor frame's fonts being available to the sandboxed
// document in the same browser, still benefits) followed directly by the
// system-ui stack, matching apps/README's "system fonts" guidance for
// widgets.
const TOKENS_CSS = `
  --w-font-family: 'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --w-font-family-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  --w-font-weight-regular: 400;
  --w-font-weight-medium: 500;
  --w-font-weight-semibold: 600;
  --w-font-weight-bold: 700;

  --w-font-size-heading-md: 1.5rem;
  --w-font-size-heading-sm: 1.25rem;
  --w-font-size-heading-xs: 1rem;
  --w-font-size-body-lg: 1.25rem;
  --w-font-size-body-md: 1rem;
  --w-font-size-body-sm: 0.875rem;
  --w-font-size-body-xs: 0.813rem;
  --w-font-size-label: 0.813rem;

  --background-neutral-primary: #ffffff;
  --background-neutral-secondary: #f0f2f5;
  --background-neutral-tertiary: #dfe3e9;
  --background-neutral-quaternary: #d4dae1;
  --background-neutral-disabled: #d4dae1;
  --background-neutral-primary-inverse: #292f36;

  --text-neutral-primary: #292f36;
  --text-neutral-secondary: #424d59;
  --text-neutral-tertiary: #576575;
  --text-neutral-disabled: #b7c1cb;
  --text-neutral-white-fixed: #ffffff;

  --borders-neutral-light: #dfe3e9;
  --borders-neutral-primary: #d4dae1;
  --borders-neutral-strong: #b7c1cb;
  --borders-neutral-solid: #292f36;
  --borders-neutral-disabled: #d4dae1;

  --background-brand-teal-extra-light: #e0f8f9;
  --background-brand-teal-light: #bfe4e8;
  --background-brand-teal-primary: #00818f;
  --background-brand-teal-strong: #007785;
  --borders-brand-teal-primary: #0093a4;
  --text-brand-teal-primary: #0093a4;

  --background-brand-purple-extra-light: #f2e2ff;
  --background-brand-purple-light: #e8cbff;
  --background-brand-purple-primary: #9657c7;
  --background-brand-purple-strong: #6c468a;
  --borders-brand-purple-primary: #9657c7;
  --text-brand-purple-primary: #9657c7;

  --background-success-light: #c7ecc6;
  --background-success-primary: #3ea33e;
  --borders-success-primary: #3ea33e;
  --text-success-primary: #286d29;

  --background-error-light: #ffbfb6;
  --background-error-primary: #e02d16;
  --borders-error-primary: #e02d16;
  --text-error-primary: #aa2513;

  --background-warning-light: #fef8c3;
  --background-warning-primary: #f9cb28;
  --borders-warning-primary: #e9ae09;
  --text-warning-primary: #7d4b07;

  --background-info-light: #bde0fa;
  --background-info-primary: #1892e3;
  --borders-info-primary: #1892e3;
  --text-info-primary: #0a5a9a;
`;

// .w-* primitive classes, styled to match genericButton.module.scss (button
// size "m"), tags.module.scss, and typography.module.scss — the same rules
// DSCO's real Button/Tags/heading components resolve to. Kept intentionally
// small: no size variants, no icon slots, nothing a widget's inline JS can't
// trivially toggle by adding/removing a class or attribute.
const PRIMITIVES_CSS = `
  body {
    font-family: var(--w-font-family);
    font-size: var(--w-font-size-body-md);
    line-height: 1.48;
    color: var(--text-neutral-primary);
    background: var(--background-neutral-primary);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--w-font-family);
    font-weight: var(--w-font-weight-semibold);
    color: var(--text-neutral-primary);
    margin: 0 0 0.5em;
  }
  h1 { font-size: var(--w-font-size-heading-md); }
  h2 { font-size: var(--w-font-size-heading-sm); }
  h3, h4, h5, h6 { font-size: var(--w-font-size-heading-xs); }

  p { margin: 0 0 1em; }

  .w-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-sizing: border-box;
    margin: 0;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    border: 1px solid transparent;
    font-family: var(--w-font-family);
    font-size: var(--w-font-size-body-sm);
    font-weight: var(--w-font-weight-semibold);
    line-height: 1.25;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
  }
  .w-button:focus-visible {
    outline: 2px solid var(--borders-brand-teal-primary);
    outline-offset: 2px;
  }
  .w-button:disabled {
    cursor: not-allowed;
  }

  .w-button--primary {
    background-color: var(--background-brand-purple-primary);
    color: var(--text-neutral-white-fixed);
  }
  .w-button--primary:hover:not(:disabled) {
    background-color: var(--background-brand-purple-strong);
  }
  .w-button--primary:disabled {
    background-color: var(--background-neutral-disabled);
    color: var(--text-neutral-disabled);
  }

  .w-button--secondary {
    background-color: var(--background-neutral-primary);
    border-color: var(--borders-neutral-solid);
    color: var(--text-neutral-primary);
  }
  .w-button--secondary:hover:not(:disabled) {
    background-color: var(--background-neutral-tertiary);
  }
  .w-button--secondary:disabled {
    border-color: var(--borders-neutral-disabled);
    color: var(--text-neutral-disabled);
    background-color: var(--background-neutral-primary);
  }

  .w-tag {
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    padding: 2px 12px;
    border-radius: 6.25rem;
    background: var(--background-brand-teal-light);
    color: var(--text-neutral-primary);
    font-family: var(--w-font-family);
    font-size: var(--w-font-size-label);
    font-weight: var(--w-font-weight-semibold);
    line-height: 1.54;
    white-space: nowrap;
  }

  .w-card {
    box-sizing: border-box;
    padding: 1rem;
    border: 1px solid var(--borders-neutral-light);
    border-radius: 0.625rem;
    background: var(--background-neutral-primary);
  }

  .w-feedback {
    box-sizing: border-box;
    padding: 0.75rem 1rem;
    border-radius: 0.625rem;
    font-family: var(--w-font-family);
    font-size: var(--w-font-size-body-sm);
    font-weight: var(--w-font-weight-medium);
    line-height: 1.4;
  }
  .w-feedback--success {
    background: var(--background-success-light);
    color: var(--text-success-primary);
  }
  .w-feedback--error {
    background: var(--background-error-light);
    color: var(--text-error-primary);
  }
  .w-feedback--neutral {
    background: var(--background-neutral-secondary);
    color: var(--text-neutral-secondary);
  }
`;

/**
 * Design-system tokens and .w-* primitive classes injected into every widget
 * document, ahead of the widget's own <style> — so a widget's rules still
 * win on specificity ties (same selector, later wins) and body defaults are
 * plain element selectors a widget can override with a single class.
 */
export const WIDGET_BRAND_CSS = `:root {${TOKENS_CSS}}\n${PRIMITIVES_CSS}`;
