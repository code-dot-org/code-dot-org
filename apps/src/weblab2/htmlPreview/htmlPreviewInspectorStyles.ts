// Inline styles for the inspector overlay nodes.
// The overlay is injected into the student's preview
// iframe — a separate document that never loads our bundle's CSS — so a CSS
// module's hashed class names would have no matching stylesheet there. Styles
// set via `el.style` (Object.assign) travel with the element across documents
// and, unlike an injected <style>, are not subject to the iframe's CSP.

export const HIGHLIGHT_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '0',
  height: '0',
  boxSizing: 'border-box',
  // #1892E3 = var(--background-info-primary). We use the literal hex because the
  // student iframe doesn't load our design-system CSS variables, so the var
  // would not resolve there.
  border: '2px solid #1892E3',
  backgroundColor: 'rgba(24, 146, 227, 0.1)', // #1892E3 at 10% opacity
  pointerEvents: 'none',
  zIndex: '2147483646',
  display: 'none',
  margin: '0',
  padding: '0',
};

export const LABEL_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  top: '0',
  left: '0',
  pointerEvents: 'none',
  zIndex: '2147483647',
  display: 'none',
  font: '12px/1.4 monospace',
  color: '#fff',
  backgroundColor: '#1892E3',
  padding: '1px 4px',
  borderRadius: '2px',
  whiteSpace: 'nowrap',
  maxWidth: '90vw',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  // Keep the syntax (`<tag> #id .class`) left-to-right even on RTL pages.
  direction: 'ltr',
  unicodeBidi: 'isolate',
};

export const SR_ONLY_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: '0',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  border: '0',
  whiteSpace: 'nowrap',
};
