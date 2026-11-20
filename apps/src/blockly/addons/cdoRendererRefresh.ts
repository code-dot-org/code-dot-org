import * as BlocklyCore from 'blockly/core';

import CdoPathObject from './cdoPathObjectZelos';

// Zelos sizes everything in multiples of GRID_UNIT. Its default of 4 is
// Scratch's size; 3 keeps blocks near Thrasos height so start-block layouts
// authored for Thrasos still fit. Text size comes from the theme instead.
const GRID_UNIT = 3;

class CdoRefreshConstantsProvider extends BlocklyCore.zelos.ConstantProvider {
  constructor() {
    super(GRID_UNIT);
    // The constructor derives the row and field radii from CORNER_RADIUS, so
    // all four must change together.
    this.CORNER_RADIUS = 8;
    this.TOP_ROW_MIN_HEIGHT = this.CORNER_RADIUS;
    this.BOTTOM_ROW_MIN_HEIGHT = this.CORNER_RADIUS;
    this.FIELD_BORDER_RECT_RADIUS = this.CORNER_RADIUS;
    this.SELECTED_GLOW_COLOUR = '#ffd84d';
    this.SELECTED_GLOW_SIZE = 1;
  }
}

export default class CdoRendererRefresh extends BlocklyCore.zelos.Renderer {
  protected override makeConstants_() {
    return new CdoRefreshConstantsProvider();
  }

  override makePathObject(
    root: SVGElement,
    style: BlocklyCore.Theme.BlockStyle
  ) {
    return new CdoPathObject(root, style, this.getConstants());
  }
}
