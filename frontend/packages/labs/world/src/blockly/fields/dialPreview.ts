// A direction dial on a block face: a circle with an arrow, and a word beside it.
//
// Two fields draw one. `field_vector` points the arrow the way the vector points
// and writes its length; `field_angle` points it at the angle and writes the
// angle. They are the same picture with a different word under it, and the
// picture is thirty lines of clipped SVG that neither should be re-deriving.
//
// It is drawn with `createSvgElement` and CSS custom properties read through
// `getCSSVariable` rather than with classes, because a field preview is handed a
// bare element to fill and Blockly measures the result: there is no stylesheet
// pass between building it and being asked how wide it is.

import {Blockly, getCSSVariable} from '@code-dot-org/blockly';

/** The dial's radius. The whole preview is a little over twice this, plus text. */
export const DIAL_RADIUS = 7;

/** Room for the dial and the gap before the words, in the same units. */
export const DIAL_LEAD = 2 * DIAL_RADIUS + 14;

/** How wide a preview showing `label` comes out. Monospace, about 7px a glyph. */
export const dialWidth = (label: string): number =>
  DIAL_LEAD + label.length * 7;

export interface DialPreview {
  /** The element the field was handed to draw into. */
  element: SVGElement;
  width: number;
  height: number;
  /**
   * Which way the arrow points, in radians, clockwise from east — `+y` is down,
   * as in the engine and the grid, so `Math.atan2(y, x)` points the right way.
   *
   * Undefined draws a dot instead, which is what a vector of no length is.
   */
  radians?: number;
  /** The words beside the dial: a length, an angle. */
  label: string;
}

/** Draw the dial and its label into `element`. */
export function renderDial({
  element,
  width,
  height,
  radians,
  label,
}: DialPreview): void {
  const svg = <T extends SVGElement>(
    tag: string | Blockly.utils.Svg<T>,
    attrs: Record<string, string | number> = {},
    parent: Element = element,
  ) => Blockly.utils.dom.createSvgElement<T>(tag, attrs, parent);
  const cx = DIAL_RADIUS + 2;
  const cy = height / 2 + 1;
  const surface = getCSSVariable('background-neutral-tertiary') || '#e8eaed';
  const edge = getCSSVariable('borders-neutral-solid') || '#c3c8d0';
  const line = getCSSVariable('borders-neutral-strong') || '#9aa0a6';
  const ink = getCSSVariable('text-neutral-primary') || '#1b1c1d';
  const arrow = getCSSVariable('background-brand-purple-primary') || '#9657c7';

  // A theme surface (as in the popup), replacing the default dark box.
  svg(Blockly.utils.Svg.RECT, {
    x: 1,
    y: 1,
    width,
    height,
    rx: 4,
    fill: surface,
    stroke: edge,
    'stroke-width': 0,
  });

  const id = 'blocklyDialClipPath_' + btoa(Blockly.utils.idGenerator.genUid());
  const g = svg(Blockly.utils.Svg.G);
  const clipPath = svg(Blockly.utils.Svg.CLIPPATH, {id}, g);

  // Clip the rectangle of the field preview
  svg(
    Blockly.utils.Svg.RECT,
    {
      x: 1,
      y: 1,
      width,
      height,
      rx: 4,
      fill: 'none',
      stroke: edge,
      'stroke-width': 1,
    },
    clipPath,
  );

  svg(
    Blockly.utils.Svg.CIRCLE,
    {
      cx,
      cy,
      r: DIAL_RADIUS + 3,
      fill: line,
      stroke: edge,
      'stroke-width': 1,
      'clip-path': `url(#${id})`,
    },
    g,
  );

  svg(
    Blockly.utils.Svg.RECT,
    {
      x: 0,
      y: 1,
      width: cx,
      height,
      rx: 0,
      fill: line,
      'clip-path': `url(#${id})`,
    },
    g,
  );

  if (radians === undefined) {
    // A dot, for a direction there is not one of — a vector with no length.
    svg(Blockly.utils.Svg.CIRCLE, {
      cx,
      cy,
      r: 3,
      fill: arrow,
      stroke: arrow,
      'stroke-width': 0,
    });
  } else {
    // The arrow spans the whole diameter — tail at one edge, tip at the
    // opposite — so which way it points is readable at this size.
    const dx = DIAL_RADIUS * Math.cos(radians);
    const dy = DIAL_RADIUS * Math.sin(radians);
    const tipX = cx + dx;
    const tipY = cy + dy;
    svg(Blockly.utils.Svg.LINE, {
      x1: cx - dx,
      y1: cy - dy,
      x2: tipX,
      y2: tipY,
      stroke: arrow,
      'stroke-width': 1.5,
    });
    // Arrowhead: two strokes back from the tip.
    for (const spread of [Math.PI - 0.45, Math.PI + 0.45]) {
      svg(Blockly.utils.Svg.LINE, {
        x1: tipX,
        y1: tipY,
        x2: tipX + 6 * Math.cos(radians + spread),
        y2: tipY + 6 * Math.sin(radians + spread),
        stroke: arrow,
        'stroke-width': 1.5,
      });
    }
  }

  const text = svg(Blockly.utils.Svg.TEXT, {
    x: DIAL_LEAD - 5,
    y: cy,
    'dominant-baseline': 'central',
    'font-family': 'monospace',
    'font-size': '12px',
    fill: ink,
  });
  text.textContent = label;

  svg(Blockly.utils.Svg.RECT, {
    x: 1,
    y: 1,
    width,
    height,
    rx: 4,
    fill: 'none',
    stroke: edge,
    'stroke-width': 1,
  });
}
