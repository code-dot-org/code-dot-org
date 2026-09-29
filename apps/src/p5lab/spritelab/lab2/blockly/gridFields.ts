// The placement-grid fields used by the grid composite blocks, as registered
// field types (see setup.ts) so JSON block definitions can reference them.
// FieldJson is a closed type, so the single-select variant is its own field
// type rather than one type with a config property.

import * as BlocklyCore from 'blockly/core';

import {CdoFieldBitmap} from '@cdo/apps/blockly/addons/cdoFieldBitmap';

import {DEFAULT_SCENE_GRID_SIZE} from '../world';

export const FIELD_GRID_TYPE = 'field_spritelab2_grid';
export const FIELD_GRID_SINGLE_TYPE = 'field_spritelab2_grid_single';

// Sized to the default playfield so a cell on a block means the same square
// as a cell in the World tab. The runtime derives its own scale from the
// bitmap it is given, so this size is a UI choice only.
const GRID_CONFIG = {
  height: DEFAULT_SCENE_GRID_SIZE,
  width: DEFAULT_SCENE_GRID_SIZE,
  fieldHeight: 42,
  buttons: {randomize: false, clear: true},
};

// A null starting value renders the empty grid from GRID_CONFIG; the
// constructor's TS type doesn't admit null but the plugin handles it.
const EMPTY_GRID = null as unknown as number[][];

/**
 * Single-select: one position, so a new mark replaces the old one. The
 * editor's intermediate value briefly holds the old mark and the clicked
 * cell together, so keep the mark this edit added — comparing against the
 * previous value (validators run with the field as `this`).
 */
export function singleCellValidator(
  this: BlocklyCore.Field | void,
  newValue: number[][]
): number[][] {
  const prev = (this?.getValue?.() ?? null) as number[][] | null;
  let keep: [number, number] | null = null;
  let first: [number, number] | null = null;
  for (let r = 0; r < newValue.length; r++) {
    for (let c = 0; c < newValue[r].length; c++) {
      if (newValue[r][c]) {
        first = first || [r, c];
        if (!prev?.[r]?.[c]) {
          keep = keep || [r, c];
        }
      }
    }
  }
  const mark = keep || first;
  return newValue.map((row, r) =>
    row.map((_, c) => (mark && mark[0] === r && mark[1] === c ? 1 : 0))
  );
}

export class GridField extends CdoFieldBitmap {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new GridField(EMPTY_GRID, undefined, GRID_CONFIG);
  }
}

export class GridSingleField extends CdoFieldBitmap {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new GridSingleField(EMPTY_GRID, singleCellValidator, GRID_CONFIG);
  }
}
