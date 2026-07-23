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

// Single-select: one position, so a new mark replaces the old one.
function singleCellValidator(newValue: number[][]): number[][] {
  let marks = 0;
  return newValue.map(row => row.map(cell => (cell && ++marks === 1 ? 1 : 0)));
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
