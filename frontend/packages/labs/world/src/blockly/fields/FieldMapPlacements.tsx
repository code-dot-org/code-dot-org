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

import {TILE_SIZE, VIEWPORT_TILES} from '../../runtime/viewport';
import {cellOf, type MapPlacement} from '../mapPlacements';

import {PlacementGrid} from './PlacementGrid';

/** The field type name (the `type` a block arg resolves to). */
export const FIELD_MAP_PLACEMENTS_NAME = 'field_map_placements';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * The preview box on the block face, in pixels. Square, like the world.
 *
 * Thirty, not the eighteen a field is normally tall: at ten cells across, a
 * smaller box gives each cell under two pixels and the arrangement stops being
 * legible — which is the whole point of drawing it. The block grows a little to
 * carry it.
 */
const MAP_SIZE = 30;

/**
 * The block face: the map, in miniature.
 *
 * A square of the world with a mark where each actor is — the same thing the
 * old Sprite Lab put on its block, and for the same reason: it says WHERE,
 * which is what the block is about, small enough to sit in a sentence. No
 * count beside it; the marks are the count, and a number that repeats what is
 * already drawn is a number in the way.
 *
 * Light box, dark marks, whatever colour the block is: the map is not part of
 * the block, it is a thing shown on it.
 */
const renderPreview = ({
  value,
  element,
  width,
  height,
}: ReactFieldPreviewContext<MapPlacement[]>) => {
  // Centred in the field, both ways. The gap between this and the word before
  // it is Blockly's own field spacing; padding drawn inside the field would
  // only move the box off its own middle.
  const left = (width - MAP_SIZE) / 2;
  const top = (height - MAP_SIZE) / 2;

  const box = document.createElementNS(SVG_NS, 'rect');
  box.setAttribute('x', String(left));
  box.setAttribute('y', String(top));
  box.setAttribute('width', String(MAP_SIZE));
  box.setAttribute('height', String(MAP_SIZE));
  box.setAttribute('rx', '2');
  box.setAttribute('fill', '#f7f9fb');
  box.setAttribute('stroke', 'rgba(0, 0, 0, 0.35)');
  box.setAttribute('stroke-width', '1');
  element.appendChild(box);

  // One mark per placement, at its cell. Only the occupied cells are drawn —
  // a hundred rects for an empty map would be a hundred rects saying nothing.
  const cellSize = MAP_SIZE / VIEWPORT_TILES;
  for (const placement of value) {
    const cell = cellOf(placement, TILE_SIZE);
    if (!cell) {
      continue;
    }
    const mark = document.createElementNS(SVG_NS, 'rect');
    mark.setAttribute('x', String(left + cell.column * cellSize));
    mark.setAttribute('y', String(top + cell.row * cellSize));
    // A hair over one cell, so neighbours read as a run rather than a dotted
    // line: at this size the gap between two marks is most of the mark.
    mark.setAttribute('width', String(cellSize + 0.3));
    mark.setAttribute('height', String(cellSize + 0.3));
    mark.setAttribute('fill', '#1a1a24');
    element.appendChild(mark);
  }
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
  getSize: () => ({width: MAP_SIZE + 4, height: MAP_SIZE + 4}),
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
