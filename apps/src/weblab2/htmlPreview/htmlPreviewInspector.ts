// Element inspector for the weblab2 HTML preview.
//
// Given the inner preview's `document`, installInspector() makes every element
// in the page reachable by hover and by Tab, drawing a highlight box + a label
// showing the element's tag, id, and class. The currently focused or hovered
// element is described to screen readers: focus uses `aria-describedby` (read as
// part of the focus event, reliable across NVDA/JAWS/VoiceOver), hover uses a
// best-effort polite live region.
//
// The helper runs in InnerHTMLPreview's realm but operates on the inner iframe's
// (same-origin) document. Elements there belong to a *different* realm, so we
// never use `instanceof Element` (it would be false) — we test `nodeType` and
// read attributes directly. Strings are hard-coded English: this page has no
// localization runtime and the text is essentially code.
//
// Everything is reversible: teardown() removes our nodes/listeners, restores the
// tabindex we added and any aria-describedby we set, and is idempotent.

export interface InspectorController {
  teardown(): void;
}

// Marks our injected nodes so they are excluded from inspection and tabbing.
const INSPECTOR_ATTR = 'data-weblab2-inspector';
// id of the hidden node that aria-describedby points at on focus.
const DESCRIPTION_ID = 'weblab2-inspector-description';

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

const ELEMENT_NODE = 1;

const HIGHLIGHT_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '0',
  height: '0',
  boxSizing: 'border-box',
  border: '2px solid #1b75d0',
  backgroundColor: 'rgba(27, 117, 208, 0.15)',
  pointerEvents: 'none',
  zIndex: '2147483646',
  display: 'none',
  margin: '0',
  padding: '0',
};

const LABEL_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  top: '0',
  left: '0',
  pointerEvents: 'none',
  zIndex: '2147483647',
  display: 'none',
  font: '12px/1.4 monospace',
  color: '#fff',
  backgroundColor: '#1b75d0',
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

const SR_ONLY_STYLE: Partial<CSSStyleDeclaration> = {
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

function asElement(target: EventTarget | null): Element | null {
  return target && (target as Node).nodeType === ELEMENT_NODE
    ? (target as Element)
    : null;
}

function isOurNode(el: Element): boolean {
  return (
    el.hasAttribute(INSPECTOR_ATTR) ||
    el.closest(`[${INSPECTOR_ATTR}]`) !== null
  );
}

interface ElementInfo {
  tag: string;
  id: string;
  classes: string[];
}

function getElementInfo(el: Element): ElementInfo {
  // getAttribute (not el.className / el.id) is uniform across HTML and SVG —
  // SVGElement.className is an SVGAnimatedString, not a string.
  const classAttr = el.getAttribute('class') || '';
  return {
    tag: el.tagName.toLowerCase(),
    id: el.getAttribute('id') || '',
    classes: classAttr.trim().split(/\s+/).filter(Boolean),
  };
}

// Visible chip, e.g. `<div> #main .hero .big`. Dev syntax, not localized.
function formatLabel(info: ElementInfo): string {
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
function formatDescription(info: ElementInfo): string {
  let text = `Element ${info.tag}`;
  if (info.id) {
    text += `, id ${info.id}`;
  }
  if (info.classes.length) {
    text += `, class ${info.classes.join(' ')}`;
  }
  return text;
}

export function installInspector(doc: Document): InspectorController {
  if (!doc || !doc.body) {
    return {teardown() {}};
  }

  const win = doc.defaultView;

  const highlight = doc.createElement('div');
  highlight.setAttribute(INSPECTOR_ATTR, 'highlight');
  highlight.setAttribute('aria-hidden', 'true');
  Object.assign(highlight.style, HIGHLIGHT_STYLE);

  const label = doc.createElement('div');
  label.setAttribute(INSPECTOR_ATTR, 'label');
  label.setAttribute('aria-hidden', 'true');
  Object.assign(label.style, LABEL_STYLE);

  // Referenced by aria-describedby on focus; read by AT, hidden visually.
  const description = doc.createElement('div');
  description.setAttribute(INSPECTOR_ATTR, 'description');
  description.id = DESCRIPTION_ID;
  Object.assign(description.style, SR_ONLY_STYLE);

  // Best-effort announcements for the mouse-hover path.
  const liveRegion = doc.createElement('div');
  liveRegion.setAttribute(INSPECTOR_ATTR, 'live');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  Object.assign(liveRegion.style, SR_ONLY_STYLE);

  doc.body.appendChild(highlight);
  doc.body.appendChild(label);
  doc.body.appendChild(description);
  doc.body.appendChild(liveRegion);

  // Elements we added tabindex to, for exact restoration on teardown.
  const taggedElements = new Set<Element>();
  // The element currently being described via focus, and its prior describedby.
  let describedElement: Element | null = null;
  let priorDescribedBy: string | null = null;

  let focusedElement: Element | null = null;
  let hoveredElement: Element | null = null;
  // The element the overlay is currently drawn over (for scroll repositioning).
  let activeElement: Element | null = null;
  let liveToggle = false;
  let rafId = 0;
  let disposed = false;

  function isTabindexEligible(el: Element): boolean {
    return (
      el.nodeType === ELEMENT_NODE &&
      !NON_RENDERED_TAGS.has(el.tagName) &&
      !isOurNode(el) &&
      !el.hasAttribute('tabindex') &&
      !el.matches(NATURALLY_FOCUSABLE)
    );
  }

  function tagSubtree(root: Element): void {
    const candidates: Element[] = [
      root,
      ...Array.from(root.querySelectorAll('*')),
    ];
    for (const el of candidates) {
      if (isTabindexEligible(el)) {
        el.setAttribute('tabindex', '0');
        taggedElements.add(el);
      }
    }
  }

  function paint(el: Element): void {
    const rect = el.getBoundingClientRect();
    const scrollX = win ? win.scrollX : 0;
    const scrollY = win ? win.scrollY : 0;
    const top = `${rect.top + scrollY}px`;
    const left = `${rect.left + scrollX}px`;
    highlight.style.top = top;
    highlight.style.left = left;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.style.display = 'block';
    label.textContent = formatLabel(getElementInfo(el));
    label.style.top = top;
    label.style.left = left;
    label.style.display = 'block';
    activeElement = el;
  }

  function hide(): void {
    highlight.style.display = 'none';
    label.style.display = 'none';
    activeElement = null;
  }

  function announceHover(el: Element): void {
    // Toggle a trailing zero-width space so identical consecutive text still
    // triggers a live-region announcement.
    liveToggle = !liveToggle;
    liveRegion.textContent =
      formatDescription(getElementInfo(el)) + (liveToggle ? '​' : '');
  }

  function describeForFocus(el: Element): void {
    clearFocusDescription();
    description.textContent = formatDescription(getElementInfo(el));
    priorDescribedBy = el.getAttribute('aria-describedby');
    el.setAttribute(
      'aria-describedby',
      priorDescribedBy
        ? `${priorDescribedBy} ${DESCRIPTION_ID}`
        : DESCRIPTION_ID
    );
    describedElement = el;
  }

  function clearFocusDescription(): void {
    if (!describedElement) {
      return;
    }
    if (priorDescribedBy === null) {
      describedElement.removeAttribute('aria-describedby');
    } else {
      describedElement.setAttribute('aria-describedby', priorDescribedBy);
    }
    describedElement = null;
    priorDescribedBy = null;
  }

  function scheduleReposition(): void {
    if (rafId || !win) {
      return;
    }
    rafId = win.requestAnimationFrame(() => {
      rafId = 0;
      if (activeElement && activeElement.isConnected) {
        paint(activeElement);
      }
    });
  }

  function onMouseOver(event: Event): void {
    const el = asElement(event.target);
    if (!el || isOurNode(el)) {
      return;
    }
    hoveredElement = el;
    if (!focusedElement) {
      paint(el);
      announceHover(el);
    }
  }

  function onMouseOut(event: Event): void {
    if (focusedElement) {
      return;
    }
    // Hide only when leaving to nothing (off the document) or onto our overlay;
    // moving between elements is handled by the next mouseover.
    const related = asElement((event as MouseEvent).relatedTarget);
    if (!related || isOurNode(related)) {
      hoveredElement = null;
      hide();
    }
  }

  function onFocusIn(event: Event): void {
    const el = asElement(event.target);
    if (!el || isOurNode(el)) {
      return;
    }
    focusedElement = el;
    paint(el);
    describeForFocus(el);
  }

  function onFocusOut(event: Event): void {
    const el = asElement(event.target);
    if (el && el === focusedElement) {
      clearFocusDescription();
      focusedElement = null;
      if (hoveredElement) {
        paint(hoveredElement);
        announceHover(hoveredElement);
      } else {
        hide();
      }
    }
  }

  // Make every existing element reachable by Tab.
  tagSubtree(doc.body);

  // Catch elements the page adds after we install.
  let observer: MutationObserver | null = null;
  if (win && typeof win.MutationObserver === 'function') {
    observer = new win.MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          const el = node.nodeType === ELEMENT_NODE ? (node as Element) : null;
          if (el) {
            tagSubtree(el);
          }
        });
      }
    });
    observer.observe(doc.body, {childList: true, subtree: true});
  }

  doc.addEventListener('mouseover', onMouseOver, true);
  doc.addEventListener('mouseout', onMouseOut, true);
  doc.addEventListener('focusin', onFocusIn, true);
  doc.addEventListener('focusout', onFocusOut, true);
  win?.addEventListener('scroll', scheduleReposition, true);
  win?.addEventListener('resize', scheduleReposition);

  return {
    teardown() {
      if (disposed) {
        return;
      }
      disposed = true;
      doc.removeEventListener('mouseover', onMouseOver, true);
      doc.removeEventListener('mouseout', onMouseOut, true);
      doc.removeEventListener('focusin', onFocusIn, true);
      doc.removeEventListener('focusout', onFocusOut, true);
      win?.removeEventListener('scroll', scheduleReposition, true);
      win?.removeEventListener('resize', scheduleReposition);
      if (rafId && win) {
        win.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      observer?.disconnect();
      clearFocusDescription();
      taggedElements.forEach(el => el.removeAttribute('tabindex'));
      taggedElements.clear();
      highlight.remove();
      label.remove();
      description.remove();
      liveRegion.remove();
    },
  };
}
