// html-to-image deep-clones an <svg> without applying computed styles to
// anything inside it, so fill and stroke coming from a CSS rule are lost:
// outlined shapes turn solid black and edges vanish. Copy the paint properties
// onto the elements themselves so the clone carries them, then restore.

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

// Returns a function restoring the style attributes this wrote.
export const inlineSvgStylesForExport = (root: HTMLElement): (() => void) => {
  const originalStyles = new Map<SVGElement, string | null>();
  root.querySelectorAll<SVGElement>('svg *').forEach(element => {
    if (!element.style) {
      return;
    }
    originalStyles.set(element, element.getAttribute('style'));
    const computed = window.getComputedStyle(element);
    SVG_PAINT_PROPERTIES.forEach(property => {
      const value = computed.getPropertyValue(property);
      if (value) {
        element.style.setProperty(property, value);
      }
    });
  });
  return () =>
    originalStyles.forEach((style, element) => {
      if (style === null) {
        element.removeAttribute('style');
      } else {
        element.setAttribute('style', style);
      }
    });
};
