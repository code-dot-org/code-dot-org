// Pure, stateless helpers and constants for the element inspector. Kept separate
// from the InspectorOverlay class (htmlPreviewInspector.ts) so the class isn't
// buried; nothing here touches instance state.
//
// These run in InnerHTMLPreview's realm but operate on the inner iframe's
// (same-origin) document, whose elements belong to a *different* realm. So we
// never use `instanceof Element` (it would be false) — we test `nodeType` and
// read attributes directly.

// Marks the inspector's injected nodes so they are excluded from inspection and
// tabbing; also used by the class when creating those nodes.
export const INSPECTOR_ATTR = 'data-weblab2-inspector';

const ELEMENT_NODE = 1;

// Tags inside <body> that render nothing and should never be tabbable/inspected.
const NON_RENDERED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'HEAD',
  'META',
  'LINK',
  'BASE',
  'TITLE',
  'TEMPLATE',
  'NOSCRIPT',
]);

// Elements already in the tab order; we must not redundantly tag these.
const NATURALLY_FOCUSABLE =
  'a[href], area[href], button, input, select, textarea, summary, iframe, object, embed, audio[controls], video[controls]';

interface ElementInfo {
  tag: string;
  id: string;
  classes: string[];
}

// Narrows an event target / node to an Element without `instanceof` (see header).
export function asElement(target: EventTarget | null): Element | null {
  return target && (target as Node).nodeType === ELEMENT_NODE
    ? (target as Element)
    : null;
}

export function isOurNode(element: Element): boolean {
  return (
    element.hasAttribute(INSPECTOR_ATTR) ||
    element.closest(`[${INSPECTOR_ATTR}]`) !== null
  );
}

export function getElementInfo(element: Element): ElementInfo {
  // getAttribute (not element.className / element.id) is uniform across HTML and
  // SVG — SVGElement.className is an SVGAnimatedString, not a string.
  const classAttr = element.getAttribute('class') || '';
  return {
    tag: element.tagName.toLowerCase(),
    id: element.getAttribute('id') || '',
    classes: classAttr.trim().split(/\s+/).filter(Boolean),
  };
}

// Visible chip, e.g. `<div> #main .hero .big`. Dev syntax, not localized.
export function formatLabel(info: ElementInfo): string {
  let text = `<${info.tag}>`;
  if (info.id) {
    text += ` #${info.id}`;
  }
  if (info.classes.length) {
    text += ' ' + info.classes.map(c => `.${c}`).join(' ');
  }
  return text;
}

// Spoken description, e.g. "Element div, id main, class hero big".
export function formatDescription(info: ElementInfo): string {
  let text = `Element ${info.tag}`;
  if (info.id) {
    text += `, id ${info.id}`;
  }
  if (info.classes.length) {
    text += `, class ${info.classes.join(' ')}`;
  }
  return text;
}

// Whether the inspector should make `element` Tab-reachable: a rendered,
// non-inspector element that isn't already focusable or explicitly tabindex'd.
export function isTabindexEligible(element: Element): boolean {
  return (
    element.nodeType === ELEMENT_NODE &&
    !NON_RENDERED_TAGS.has(element.tagName) &&
    !isOurNode(element) &&
    !element.hasAttribute('tabindex') &&
    !element.matches(NATURALLY_FOCUSABLE)
  );
}
