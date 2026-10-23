// html-to-image deep-clones an <svg> without applying computed styles to
// anything inside it, so fill and stroke coming from a CSS rule are lost:
// outlined shapes turn solid black and edges vanish. Copy the paint properties
// onto the elements themselves so the clone carries them, then restore.
// Known issue in html-to-image: https://github.com/bubkoo/html-to-image/issues/516
// but it doesn't look like much/any development is happening on it.
// We need to use version 1.11.13 in order to use includeStyleProperties.

const SVG_PAINT_PROPERTIES = [
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-dasharray',
  'stroke-dashoffset',
  'opacity',
  'color',
  'display',
  'visibility',
  'marker-start',
  'marker-mid',
  'marker-end',
  'clip-path',
  'clip-rule',
  'mask',
  'filter',
  'paint-order',
  'vector-effect',
  'shape-rendering',
  'stop-color',
  'stop-opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-anchor',
  'dominant-baseline',
  'letter-spacing',
  'word-spacing',
  'text-decoration',
  'mix-blend-mode',
  'isolation',
];

interface InjectedProperty {
  property: string;
  injected: string;
  original: string;
  originalPriority: string;
}

interface ElementEdit {
  element: SVGElement;
  hadStyleAttribute: boolean;
  properties: InjectedProperty[];
}

// Returns a function restoring the inline values this wrote.
export const inlineSvgStylesForExport = (root: HTMLElement): (() => void) => {
  const edits: ElementEdit[] = [];
  root.querySelectorAll<SVGElement>('svg *').forEach(element => {
    if (!element.style) {
      return;
    }
    const hadStyleAttribute = element.hasAttribute('style');
    const computed = window.getComputedStyle(element);
    const properties: InjectedProperty[] = [];
    SVG_PAINT_PROPERTIES.forEach(property => {
      const value = computed.getPropertyValue(property);
      if (!value) {
        return;
      }
      const original = element.style.getPropertyValue(property);
      const originalPriority = element.style.getPropertyPriority(property);
      element.style.setProperty(property, value);
      properties.push({
        property,
        injected: element.style.getPropertyValue(property),
        original,
        originalPriority,
      });
    });
    edits.push({element, hadStyleAttribute, properties});
  });

  // A value that changed during the capture was written by the app, so it stays.
  return () =>
    edits.forEach(({element, hadStyleAttribute, properties}) => {
      properties.forEach(({property, injected, original, originalPriority}) => {
        if (element.style.getPropertyValue(property) !== injected) {
          return;
        }
        if (original) {
          element.style.setProperty(property, original, originalPriority);
        } else {
          element.style.removeProperty(property);
        }
      });
      if (!hadStyleAttribute && !element.getAttribute('style')) {
        element.removeAttribute('style');
      }
    });
};
