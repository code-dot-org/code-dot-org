// The 8x8 placement-grid fields used by the grid composite blocks, as
// registered field types (see setup.ts) so JSON block definitions can
// reference them. FieldJson is a closed type, so the single-select variant is
// its own field type rather than one type with a config property.

import * as BlocklyCore from 'blockly/core';

import {CdoFieldBitmap} from '@cdo/apps/blockly/addons/cdoFieldBitmap';

export const FIELD_GRID_TYPE = 'field_spritelab2_grid';
export const FIELD_GRID_SINGLE_TYPE = 'field_spritelab2_grid_single';

const GRID_CONFIG = {
  height: 8,
  width: 8,
  fieldHeight: 42,
  buttons: {randomize: false, clear: true},
};

// A null starting value renders the empty grid from GRID_CONFIG; the
// constructor's TS type doesn't admit null but the plugin handles it.
const EMPTY_GRID = null as unknown as number[][];

// Single-select: one position, so a new mark replaces the old one. Keep the
// mark this edit ADDED (the editor's intermediate value briefly holds the
// old mark and the clicked cell together; keeping the first in scan order
// instead made cells below the selection unselectable). Validators run with
// the field as `this`.
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
