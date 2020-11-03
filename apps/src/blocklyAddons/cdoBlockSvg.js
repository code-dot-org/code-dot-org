import GoogleBlockly from 'blockly/core';
import BlockSvgUnused from './blockSvgUnused';

export default class BlockSvg extends GoogleBlockly.BlockSvg {
  constructor(workspace, prototypeName, opt_id) {
    super(workspace, prototypeName, ++Blockly.uidCounter_); // Use counter instead of randomly generated IDs

    /* *
     * Workaround to make block id available on SVG in IE.
     * I opened https://github.com/google/blockly/issues/4419 so hopefully we can remove this with the next
     * Blockly release if they fix the issue.
     * In the meantime, the workaround is to call svgGroup_.setAttribute(), instead of setting
     * svgGroup_.dataset['id'] directly.
     */
    if (this.svgGroup_.dataset === undefined) {
      this.svgGroup_.setAttribute('data-id', this.id);
    }
    this.canDisconnectFromParent_ = true;
  }

  addUnusedBlockFrame(helpClickFunc) {
    if (!this.unusedSvg_) {
      this.unusedSvg_ = new BlockSvgUnused(this, helpClickFunc);
    }
    this.unusedSvg_.render(this.svgGroup_);
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
    if (Blockly.editBlocks) {
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
      const lockToParent = {
        text: this.canDisconnectFromParent_
          ? 'Lock to Parent Block'
          : 'Unlock from Parent Block',
        enabled: true,
        callback: function() {
          this.setCanDisconnectFromParent(!this.canDisconnectFromParent_);
          Blockly.ContextMenu.hide();
        }.bind(this)
      };
      menuOptions.push(deletable);
      menuOptions.push(movable);
      menuOptions.push(editable);
      menuOptions.push(lockToParent);
    }
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
    return false; // TODO
  }

  onMouseDown_(e) {
    if (!Blockly.utils.isRightButton(e) && !this.canDisconnectFromParent_) {
      return;
    }
    super.onMouseDown_(e);
  }

  render() {
    super.render();
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
}
