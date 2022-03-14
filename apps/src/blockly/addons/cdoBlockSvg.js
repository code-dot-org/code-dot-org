import GoogleBlockly from 'blockly/core';
import BlockSvgUnused from './blockSvgUnused';

export default class BlockSvg extends GoogleBlockly.BlockSvg {
  constructor(workspace, prototypeName, opt_id) {
    super(workspace, prototypeName, ++Blockly.uidCounter_); // Use counter instead of randomly generated IDs

    this.canDisconnectFromParent_ = true;
  }

  addUnusedBlockFrame(helpClickFunc) {
    if (!this.unusedSvg_) {
      this.unusedSvg_ = new BlockSvgUnused(this, helpClickFunc);
    }
    this.unusedSvg_.render(this.svgGroup_);
  }

  /**
   * @override
   * Disable overwrite checks
   */
  mixin(mixinObj, opt_disableCheck) {
    super.mixin(mixinObj, true);
  }

  isUnused() {
    const isTopBlock = this.previousConnection === null;
    const hasParentBlock = !!this.parentBlock_;
    return !(isTopBlock || hasParentBlock);
  }

  isVisible() {
    // TODO (eventually), but all Flappy blocks are visible, so this won't be a problem
    // until we convert other labs
    return true;
  }

  setCanDisconnectFromParent(canDisconnect) {
    this.canDisconnectFromParent_ = canDisconnect;
  }

  customContextMenu(menuOptions) {
    // Only show context menu for levelbuilders
    if (Blockly.isStartMode) {
      const deletable = {
        text: this.deletable_
          ? 'Make Undeletable to Users'
          : 'Make Deletable to Users',
        enabled: true,
        callback: function() {
          this.setDeletable(!this.isDeletable());
          Blockly.ContextMenu.hide();
        }.bind(this)
      };
      const movable = {
        text: this.movable_
          ? 'Make Immovable to Users'
          : 'Make Movable to Users',
        enabled: true,
        callback: function() {
          this.setMovable(!this.isMovable());
          Blockly.ContextMenu.hide();
        }.bind(this)
      };
      const editable = {
        text: this.editable_ ? 'Make Uneditable' : 'Make editable',
        enabled: true,
        callback: function() {
          this.setEditable(!this.isEditable());
          Blockly.ContextMenu.hide();
        }.bind(this)
      };
      const shadow = {
        text: 'Make Shadow',
        enabled: true,
        callback: function() {
          this.setShadow(true);
          Blockly.ContextMenu.hide();
        }.bind(this)
      };
      const unshadow = {
        // If there's 1 child, text should be 'Make Child Block Non-Shadow'
        // If there's n children, text should be `Make ${n} Child Blocks Non-Shadow`
        text: `Make ${
          this.shadowChildCount() > 1 ? `${this.shadowChildCount()} ` : ''
        }Child Block${this.shadowChildCount() > 1 ? 's' : ''} Non-Shadow`,
        enabled: true,
        callback: function() {
          this.getChildren().forEach(child => child.setShadow(false));
          Blockly.ContextMenu.hide();
        }.bind(this)
      };
      menuOptions.push(deletable);
      menuOptions.push(movable);
      menuOptions.push(editable);
      if (this.canBeShadow()) {
        menuOptions.push(shadow);
      }
      if (this.hasShadowChildren()) {
        menuOptions.push(unshadow);
      }
    }
  }

  /** A block can be made into a shadow if:
   * -It has a surrounding parent block.
   * -It does not contain a variable field.
   * -It does not have any non-shadow children.
   */
  canBeShadow() {
    return (
      this.getSurroundParent() &&
      !this.getVarModels().length &&
      !this.nonShadowChildCount()
    );
  }

  shadowChildCount() {
    return this.getChildren().filter(child => child.isShadow()).length;
  }

  nonShadowChildCount() {
    return this.getChildren().filter(child => !child.isShadow()).length;
  }

  hasShadowChildren() {
    return this.shadowChildCount() > 0;
  }

  dispose() {
    super.dispose();
    this.removeUnusedBlockFrame();
  }

  getTitles() {
    let fields = [];
    this.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        fields.push(field);
      });
    });
    return fields;
  }

  getTitleValue(name) {
    return super.getFieldValue(name);
  }

  isUserVisible() {
    return false; // TODO - used for EXTRA_TOP_BLOCKS_FAIL feedback
  }

  onMouseDown_(e) {
    if (!Blockly.utils.isRightButton(e) && !this.canDisconnectFromParent_) {
      return;
    }
    super.onMouseDown_(e);
  }

  render(opt_bubble) {
    super.render(opt_bubble);
    this.removeUnusedBlockFrame();
  }

  removeUnusedBlockFrame() {
    if (this.unusedSvg_) {
      this.unusedSvg_.dispose();
      this.unusedSvg_ = null;
    }
  }

  setHSV(h, s, v) {
    return super.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
  }

  getHexColour() {
    return super.getColour();
  }
}
