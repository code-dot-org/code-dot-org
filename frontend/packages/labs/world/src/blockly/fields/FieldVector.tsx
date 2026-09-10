// The `vector` field — a Blockly field, built the idiomatic Music-Lab way with
// `createReactField`, whose popup is a React arrow-grid editor (VectorEditor).
// It displays the current `x, y` on the block face; clicking opens the grid.

import {ThemeProvider} from '@mui/material';

import {createReactField} from '@code-dot-org/blockly';
import type {ReactFieldPreviewContext} from '@code-dot-org/blockly';
import {CdoTheme} from '@code-dot-org/component-library/themes';

import {dialWidth, renderDial} from './dialPreview';
import {DEFAULT_VECTOR, VectorEditor, type VectorValue} from './VectorEditor';

export {DEFAULT_VECTOR, type VectorValue} from './VectorEditor';

/** The field type name (the `type` a block arg resolves to). */
export const FIELD_VECTOR_NAME = 'field_vector';

// The block face shows a direction dial (a circle with an arrow pointing the way
// the vector points) next to its magnitude, rather than the raw x/y. The dial
// itself is `dialPreview`, shared with the angle field.

/** The vector's length, rounded for display. */
const magnitude = (value: VectorValue): string =>
  String(Math.round(Math.hypot(value.x, value.y) * 10) / 10);

/** Draw the direction dial + magnitude on the block. */
const renderVectorPreview = ({
  value,
  element,
  width,
  height,
}: ReactFieldPreviewContext<VectorValue>) =>
  renderDial({
    element,
    width,
    height,
    // A vector of no length points nowhere, and the dial draws a dot.
    radians:
      value.x !== 0 || value.y !== 0 ? Math.atan2(value.y, value.x) : undefined,
    label: magnitude(value),
  });

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
  // The dial is fixed-width; grow to fit the magnitude text.
  getSize: ({value}) => ({width: dialWidth(magnitude(value)), height: 18}),
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
