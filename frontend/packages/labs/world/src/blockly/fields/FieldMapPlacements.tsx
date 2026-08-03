// The `map` field — where a `create actor in map` block keeps its arrangement.
//
// A React field (the same machinery as `field_vector`), so the arrangement is
// the FIELD'S VALUE: Blockly serializes it with the block, into the `.world`
// file, and loads it back without anything of ours in the middle. No mutator,
// no extraState, no dialog, no handler seam — a click on the block face opens a
// grid in the dropdown, and that is the feature.
//
// The block face shows how many are placed, because the arrangement itself is
// somewhere else and a block should say how much of it there is.

import {ThemeProvider} from '@mui/material';

import {createReactField} from '@code-dot-org/blockly';
import type {ReactFieldPreviewContext} from '@code-dot-org/blockly';
import {CdoTheme} from '@code-dot-org/component-library/themes';

import type {MapPlacement} from '../mapPlacements';

import {PlacementGrid} from './PlacementGrid';

/** The field type name (the `type` a block arg resolves to). */
export const FIELD_MAP_PLACEMENTS_NAME = 'field_map_placements';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * The block face: a small grid glyph and a count.
 *
 * A glyph rather than the word "map", because the word is already in the block
 * ("create … in map") and saying it twice is not saying anything.
 */
const renderPreview = ({
  value,
  element,
  height,
}: ReactFieldPreviewContext<MapPlacement[]>) => {
  const size = 10;
  const top = (height - size) / 2;
  const grid = document.createElementNS(SVG_NS, 'g');
  for (const [x, y] of [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ]) {
    const box = document.createElementNS(SVG_NS, 'rect');
    box.setAttribute('x', String(2 + x * (size / 2 + 1)));
    box.setAttribute('y', String(top + y * (size / 2 + 1)));
    box.setAttribute('width', String(size / 2));
    box.setAttribute('height', String(size / 2));
    box.setAttribute('fill', 'currentColor');
    box.setAttribute('opacity', value.length ? '0.9' : '0.4');
    grid.appendChild(box);
  }
  element.appendChild(grid);

  const count = document.createElementNS(SVG_NS, 'text');
  count.setAttribute('x', String(size + 6));
  count.setAttribute('y', String(height / 2));
  count.setAttribute('dominant-baseline', 'central');
  count.setAttribute('fill', 'currentColor');
  count.setAttribute('font-size', '11');
  count.textContent = String(value.length);
  element.appendChild(count);
};

// The popup renders in its own React root (Blockly's DropDownDiv), outside the
// app's providers — so the design-system theme is supplied here, as the vector
// field does it.
const ThemedEditor = ({children}: {children: React.ReactNode}) => (
  <ThemeProvider theme={CdoTheme}>{children}</ThemeProvider>
);

export const plugin = createReactField<MapPlacement[]>({
  name: FIELD_MAP_PLACEMENTS_NAME,
  defaultValue: () => [],
  Editor: ({value, onChange, sourceBlock}) => (
    <PlacementGrid
      value={value}
      onChange={onChange}
      sourceBlock={sourceBlock}
    />
  ),
  EditorWrapper: ThemedEditor,
  renderPreview,
  renderBackground: false,
  getText: value => String(value.length),
  getSize: ({value}) => ({
    width: 22 + String(value.length).length * 7,
    height: 18,
  }),
  dropdownStyle: {
    backgroundColor: 'var(--background-neutral-secondary)',
    color: 'var(--text-neutral-primary)',
    padding: '8px',
    width: 'auto',
  },
  ariaLabel: 'map placements editor',
  getAriaValue: value =>
    value.length === 1 ? '1 placed' : `${value.length} placed`,
});

/**
 * A block-arg definition for the map field. Spread into a block's `args0` with
 * the field's instance `name`; the registry swaps the plugin for its field-type
 * name at definition time.
 */
export const fieldMapPlacementsArg = (name: string) =>
  ({type: plugin, name, currentValue: []}) as const;

export default plugin;
