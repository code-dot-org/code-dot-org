// The `angle` field — a direction dial on the block, a bigger one in its popup.
//
// The legacy Artist lab has one of these and it is a number field that opens a
// picker (`apps/src/blockly/addons/cdoFieldAngleTextInput`): the block shows the
// digits and nothing else. This one shows the digits AND which way they point,
// the way `field_vector` beside it does, because a direction is the sort of
// thing you recognize faster than you read. `45°` and an arrow pointing down-
// right say the same thing, and only one of them survives being glanced at.
//
// Built the idiomatic Music-Lab way with `createReactField`, like the vector
// field: the dial on the block face is drawn by `dialPreview` (shared with it),
// and clicking opens `AngleEditor`.

import {ThemeProvider} from '@mui/material';

import {createReactField} from '@code-dot-org/blockly';
import type {ReactFieldPreviewContext} from '@code-dot-org/blockly';
import {CdoTheme} from '@code-dot-org/component-library/themes';

import {AngleEditor, DEFAULT_ANGLE, normalizeAngle} from './AngleEditor';
import {dialWidth, renderDial} from './dialPreview';

/** The field type name (the `type` a block arg resolves to). */
export const FIELD_ANGLE_NAME = 'field_angle';

/** How the angle reads on the block. */
const degrees = (value: number): string => `${normalizeAngle(value)}°`;

const renderAnglePreview = ({
  value,
  element,
  width,
  height,
}: ReactFieldPreviewContext<number>) =>
  renderDial({
    element,
    width,
    height,
    // Always a direction: unlike a vector, every angle is one — zero degrees
    // points east rather than nowhere.
    radians: (normalizeAngle(value) * Math.PI) / 180,
    label: degrees(value),
  });

// The field's popup renders in its own React root (Blockly's DropDownDiv), so it
// is outside the app's MUI ThemeProvider.
const ThemedEditor = ({children}: {children: React.ReactNode}) => (
  <ThemeProvider theme={CdoTheme}>{children}</ThemeProvider>
);

export const plugin = createReactField<number>({
  name: FIELD_ANGLE_NAME,
  defaultValue: DEFAULT_ANGLE,
  Editor: AngleEditor,
  EditorWrapper: ThemedEditor,
  renderPreview: renderAnglePreview,
  // We paint our own theme surface, so skip the factory's dark background box.
  renderBackground: false,
  getText: degrees,
  getSize: ({value}) => ({width: dialWidth(degrees(value)), height: 18}),
  // Match the surrounding lab surface rather than the default dark dropdown.
  dropdownStyle: {
    backgroundColor: 'var(--background-neutral-secondary)',
    color: 'var(--text-neutral-primary)',
    padding: '8px',
    width: 'auto',
  },
  ariaLabel: 'angle editor',
  getAriaValue: value => `${normalizeAngle(value)} degrees`,
});

/**
 * A block-arg definition for the angle field. Spread into a block's `args0`
 * with the field's instance `name` and, optionally, a `currentValue` default.
 * The registry swaps the plugin for its field-type name at definition time.
 */
export const fieldAngleArg = (name: string, value: number) =>
  ({type: plugin, name, currentValue: value}) as const;

export default plugin;
