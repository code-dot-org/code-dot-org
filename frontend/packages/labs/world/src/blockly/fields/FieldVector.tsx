// The `vector` field — a Blockly field, built the idiomatic Music-Lab way with
// `createReactField`, whose popup is a React arrow-grid editor (VectorEditor).
// It displays the current `x, y` on the block face; clicking opens the grid.

import {ThemeProvider} from '@mui/material';

import {Blockly, createReactField, getCSSVariable} from '@code-dot-org/blockly';
import type {ReactFieldPreviewContext} from '@code-dot-org/blockly';
import {CdoTheme} from '@code-dot-org/component-library/themes';

import {DEFAULT_VECTOR, VectorEditor, type VectorValue} from './VectorEditor';

export {DEFAULT_VECTOR, type VectorValue} from './VectorEditor';

/** The field type name (the `type` a block arg resolves to). */
export const FIELD_VECTOR_NAME = 'field_vector';

// The block face shows a direction dial (a circle with an arrow pointing the way
// the vector points) next to its magnitude, rather than the raw x/y.
const DIAL_RADIUS = 7;

/** The vector's length, rounded for display. */
const magnitude = (value: VectorValue): string =>
  String(Math.round(Math.hypot(value.x, value.y) * 10) / 10);

/** Draw the direction dial + magnitude on the block. */
const renderVectorPreview = ({
  value,
  element,
  width,
  height,
}: ReactFieldPreviewContext<VectorValue>) => {
  const svg = (
    tag: string,
    attrs: Record<string, string | number>,
    parent = element,
  ) => Blockly.utils.dom.createSvgElement(tag, attrs, parent);
  const cx = DIAL_RADIUS + 2;
  const cy = height / 2 + 1;
  const surface = getCSSVariable('background-neutral-tertiary') || '#e8eaed';
  const edge = getCSSVariable('borders-neutral-solid') || '#c3c8d0';
  const line = getCSSVariable('borders-neutral-strong') || '#9aa0a6';
  const ink = getCSSVariable('text-neutral-primary') || '#1b1c1d';
  const arrow = getCSSVariable('background-brand-purple-primary') || '#9657c7';

  // A theme surface (as in the popup grid), replacing the default dark box.
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

  const id =
    'blocklyVectorClipPath_' + btoa(Blockly.utils.idGenerator.genUid());

  const g = svg(Blockly.utils.Svg.G);

  const clipPath = svg(
    Blockly.utils.Svg.CLIPPATH,
    {
      id,
    },
    g,
  );

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

  // `+y` is down (as in the engine/grid), so atan2(y, x) points the right way.
  // The arrow spans the whole diameter — tail at one edge, tip at the opposite.
  if (value.x !== 0 || value.y !== 0) {
    const angle = Math.atan2(value.y, value.x);
    const dx = DIAL_RADIUS * Math.cos(angle);
    const dy = DIAL_RADIUS * Math.sin(angle);
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
        x2: tipX + 6 * Math.cos(angle + spread),
        y2: tipY + 6 * Math.sin(angle + spread),
        stroke: arrow,
        'stroke-width': 1.5,
      });
    }
  } else {
    // Render just a dot when the vector has no magnitude
    svg(Blockly.utils.Svg.CIRCLE, {
      cx,
      cy,
      r: 3,
      fill: arrow,
      stroke: arrow,
      'stroke-width': 0,
    });
  }

  const text = svg(Blockly.utils.Svg.TEXT, {
    x: 2 * DIAL_RADIUS + 9,
    y: cy,
    'dominant-baseline': 'central',
    'font-family': 'monospace',
    'font-size': '12px',
    fill: ink,
  });
  text.textContent = magnitude(value);

  // A theme surface (as in the popup grid), replacing the default dark box.
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
};

// The field's popup renders in its own React root (Blockly's DropDownDiv), so it
// is outside the app's MUI ThemeProvider — the editor's MUI IconButtons need the
// design-system theme supplied here.
const ThemedEditor = ({children}: {children: React.ReactNode}) => (
  <ThemeProvider theme={CdoTheme}>{children}</ThemeProvider>
);

export const plugin = createReactField<VectorValue>({
  name: FIELD_VECTOR_NAME,
  defaultValue: DEFAULT_VECTOR,
  Editor: VectorEditor,
  EditorWrapper: ThemedEditor,
  renderPreview: renderVectorPreview,
  // We paint our own theme surface, so skip the factory's dark background box.
  renderBackground: false,
  getText: magnitude,
  // The dial is fixed-width; grow to fit the magnitude text (~7px/char).
  getSize: ({value}) => ({
    width: 2 * DIAL_RADIUS + 14 + magnitude(value).length * 7,
    height: 18,
  }),
  // Match the surrounding lab surface rather than the default dark dropdown.
  dropdownStyle: {
    backgroundColor: 'var(--background-neutral-secondary)',
    color: 'var(--text-neutral-primary)',
    padding: '8px',
    width: 'auto',
  },
  ariaLabel: 'vector editor',
  getAriaValue: value => `x ${value.x}, y ${value.y}`,
});

/**
 * A block-arg definition for the vector field. Spread into a block's `args0`
 * with the field's instance `name` and, optionally, a `currentValue` default.
 * The registry swaps the plugin for its field-type name at definition time.
 */
export const fieldVectorArg = (name: string, value: VectorValue) =>
  ({type: plugin, name, currentValue: value}) as const;

export default plugin;
