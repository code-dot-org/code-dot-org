import {BlockSvg} from 'blockly';

export default class CdoBlockSvg extends BlockSvg {
  // mixinObj is any on Blockly's side
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mixin(mixinObj: any) {
    super.mixin(mixinObj, true);
  }

  isDisabled() {
    return !this.isEnabled();
  }

  getHexColour() {
    // In cdo Blockly labs, getColour() returns a numerical hue value, while
    // in newer Google Blockly it returns a hexademical color value string.
    // This is only used for locationPicker blocks and can likely be deprecated
    // once Sprite Lab is using Google Blockly.
    return this.getColour();
  }

  isVisible() {
    // TODO (eventually) - All Google Blockly blocks are currently visible.
    // This shouldn't be a problem until we convert other labs.
    return true;
  }

  isUserVisible() {
    // TODO - used for EXTRA_TOP_BLOCKS_FAIL feedback
    return false;
  }
}
