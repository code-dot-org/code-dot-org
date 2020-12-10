import GoogleBlockly from 'blockly/core';

export default class CdoPathObject extends GoogleBlockly.geras.PathObject {
  // The built-in function also adds a cross-hatch fill pattern to disabled blocks, which we don't want.
  // Overrriding the function here so we can just set the class but not add the fill pattern.
  updateDisabled_(disabled) {
    this.setClass_('blocklyDisabled', disabled);
  }

  // The built-in function adds a light filter over the whole block. We want to match our old
  // behavior where highlighting the block adds the same yellow outline as selecting.
  updateHighlighted(highlighted) {
    this.setClass_('blocklySelected', highlighted);
  }
}
