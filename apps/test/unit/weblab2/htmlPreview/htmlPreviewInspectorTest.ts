import {installInspector} from '@cdo/apps/weblab2/htmlPreview/htmlPreviewInspector';

// The helper does pure DOM work, so we exercise it against an isolated document
// (no browsing context). jsdom performs no layout, so getBoundingClientRect()
// returns zeros — we assert behavior (display toggles, text, attributes), never
// pixel positions. The MutationObserver / scroll-reposition paths require a
// defaultView and are covered by manual QA, not here.

const MARKED = '[data-weblab2-inspector]';
const DESCRIPTION_ID = 'weblab2-inspector-description';

function makeDoc(bodyHtml: string): Document {
  const doc = document.implementation.createHTMLDocument('test');
  doc.body.innerHTML = bodyHtml;
  return doc;
}

function highlightOf(doc: Document): HTMLElement {
  return doc.querySelector(
    '[data-weblab2-inspector="highlight"]'
  ) as HTMLElement;
}

function labelOf(doc: Document): HTMLElement {
  return doc.querySelector('[data-weblab2-inspector="label"]') as HTMLElement;
}

function mouseOver(el: Element) {
  el.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
}

function mouseOut(el: Element, relatedTarget: EventTarget | null = null) {
  el.dispatchEvent(new MouseEvent('mouseout', {bubbles: true, relatedTarget}));
}

function focusIn(el: Element) {
  el.dispatchEvent(new Event('focusin', {bubbles: true}));
}

function focusOut(el: Element) {
  el.dispatchEvent(new Event('focusout', {bubbles: true}));
}

describe('htmlPreviewInspector', () => {
  it('injects a highlight, label, description, and polite live region', () => {
    const doc = makeDoc('<p>hi</p>');
    const controller = installInspector(doc);

    expect(doc.querySelectorAll(MARKED)).toHaveLength(4);
    expect(doc.querySelector('[aria-live="polite"]')).not.toBeNull();
    expect(doc.getElementById(DESCRIPTION_ID)).not.toBeNull();

    controller.teardown();
  });

  it('returns a no-op controller when the document has no body', () => {
    const doc = document.implementation.createDocument(null, null, null);
    expect(() => installInspector(doc).teardown()).not.toThrow();
  });

  describe('hover', () => {
    it('shows the overlay with tag, id, and class', () => {
      const doc = makeDoc('<p id="foo" class="bar baz">hi</p>');
      const controller = installInspector(doc);
      const p = doc.querySelector('p') as Element;

      mouseOver(p);

      expect(highlightOf(doc).style.display).toBe('block');
      expect(labelOf(doc).style.display).toBe('block');
      expect(labelOf(doc).textContent).toBe('<p> #foo .bar .baz');

      controller.teardown();
    });

    it('shows only the tag when there is no id or class', () => {
      const doc = makeDoc('<div>hi</div>');
      const controller = installInspector(doc);

      mouseOver(doc.querySelector('div') as Element);

      expect(labelOf(doc).textContent).toBe('<div>');

      controller.teardown();
    });

    it('reads class via getAttribute so SVG elements do not throw', () => {
      const doc = makeDoc('<svg class="icon"></svg>');
      const controller = installInspector(doc);
      const svg = doc.querySelector('svg') as Element;

      expect(() => mouseOver(svg)).not.toThrow();
      expect(labelOf(doc).textContent).toBe('<svg> .icon');

      controller.teardown();
    });

    it('updates the polite live region', () => {
      const doc = makeDoc('<p id="foo">hi</p>');
      const controller = installInspector(doc);

      mouseOver(doc.querySelector('p') as Element);

      const live = doc.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(live.textContent).toContain('Element p, id foo');

      controller.teardown();
    });

    it('hides the overlay when the pointer leaves the document', () => {
      const doc = makeDoc('<p>hi</p>');
      const controller = installInspector(doc);
      const p = doc.querySelector('p') as Element;

      mouseOver(p);
      expect(highlightOf(doc).style.display).toBe('block');

      mouseOut(p, null);
      expect(highlightOf(doc).style.display).toBe('none');

      controller.teardown();
    });

    it('ignores events targeting its own injected nodes', () => {
      const doc = makeDoc('<p>hi</p>');
      const controller = installInspector(doc);

      mouseOver(highlightOf(doc));

      expect(highlightOf(doc).style.display).toBe('none');

      controller.teardown();
    });
  });

  describe('keyboard focus', () => {
    it('sets aria-describedby and writes a spoken description on focus', () => {
      const doc = makeDoc('<p id="foo" class="bar">hi</p>');
      const controller = installInspector(doc);
      const p = doc.querySelector('p') as Element;

      focusIn(p);

      expect(p.getAttribute('aria-describedby')).toBe(DESCRIPTION_ID);
      expect(doc.getElementById(DESCRIPTION_ID)?.textContent).toBe(
        'Element p, id foo, class bar'
      );
      expect(highlightOf(doc).style.display).toBe('block');

      controller.teardown();
    });

    it('removes aria-describedby on blur when there was none before', () => {
      const doc = makeDoc('<p>hi</p>');
      const controller = installInspector(doc);
      const p = doc.querySelector('p') as Element;

      focusIn(p);
      focusOut(p);

      expect(p.hasAttribute('aria-describedby')).toBe(false);

      controller.teardown();
    });

    it('preserves a pre-existing aria-describedby', () => {
      const doc = makeDoc('<p aria-describedby="existing">hi</p>');
      const controller = installInspector(doc);
      const p = doc.querySelector('p') as Element;

      focusIn(p);
      expect(p.getAttribute('aria-describedby')).toBe(
        `existing ${DESCRIPTION_ID}`
      );

      focusOut(p);
      expect(p.getAttribute('aria-describedby')).toBe('existing');

      controller.teardown();
    });

    it('lets focus take precedence over hover', () => {
      const doc = makeDoc('<p id="foo">a</p><span id="bar">b</span>');
      const controller = installInspector(doc);

      focusIn(doc.querySelector('p') as Element);
      mouseOver(doc.querySelector('span') as Element);

      // Still describing the focused <p>, not the hovered <span>.
      expect(labelOf(doc).textContent).toBe('<p> #foo');

      controller.teardown();
    });

    it('hides on blur instead of snapping back to a hover the pointer has left', () => {
      const doc = makeDoc('<div id="a">a</div><div id="b">b</div>');
      const controller = installInspector(doc);
      const a = doc.getElementById('a') as Element;
      const b = doc.getElementById('b') as Element;

      mouseOver(a); // hover a
      focusIn(b); // focus b takes over the overlay from hover
      mouseOut(a, null); // pointer then leaves the document entirely
      focusOut(b); // blur b

      // Pointer and focus are both gone, so the overlay hides rather than
      // falling back to the no-longer-hovered <div id="a">.
      expect(highlightOf(doc).style.display).toBe('none');

      controller.teardown();
    });
  });

  describe('tabbability', () => {
    it('tags plain elements but leaves focusable, pre-tabindexed, and inert ones alone', () => {
      const doc = makeDoc(
        '<div id="a">x</div>' +
          '<button id="b">y</button>' +
          '<span id="c" tabindex="-1">z</span>' +
          '<script>void 0;</script>'
      );
      const controller = installInspector(doc);

      expect(doc.getElementById('a')?.getAttribute('tabindex')).toBe('0');
      expect(doc.getElementById('b')?.hasAttribute('tabindex')).toBe(false);
      expect(doc.getElementById('c')?.getAttribute('tabindex')).toBe('-1');
      expect(
        (doc.querySelector('script') as Element).hasAttribute('tabindex')
      ).toBe(false);
      doc
        .querySelectorAll(MARKED)
        .forEach(node => expect(node.hasAttribute('tabindex')).toBe(false));

      controller.teardown();
    });
  });

  describe('teardown', () => {
    it('removes injected nodes and restores tabindex exactly', () => {
      const doc = makeDoc(
        '<div id="a">x</div><span id="c" tabindex="-1">z</span>'
      );
      const controller = installInspector(doc);

      expect(doc.getElementById('a')?.getAttribute('tabindex')).toBe('0');

      controller.teardown();

      expect(doc.querySelectorAll(MARKED)).toHaveLength(0);
      expect(doc.getElementById('a')?.hasAttribute('tabindex')).toBe(false);
      expect(doc.getElementById('c')?.getAttribute('tabindex')).toBe('-1');
    });

    it('restores aria-describedby set during a focus that outlives teardown', () => {
      const doc = makeDoc('<p>hi</p>');
      const controller = installInspector(doc);
      const p = doc.querySelector('p') as Element;

      focusIn(p);
      expect(p.getAttribute('aria-describedby')).toBe(DESCRIPTION_ID);

      controller.teardown();
      expect(p.hasAttribute('aria-describedby')).toBe(false);
    });

    it('is idempotent and stops responding to events', () => {
      const doc = makeDoc('<p>hi</p>');
      const controller = installInspector(doc);

      controller.teardown();
      expect(() => controller.teardown()).not.toThrow();

      mouseOver(doc.querySelector('p') as Element);
      expect(doc.querySelectorAll(MARKED)).toHaveLength(0);
    });
  });
});
