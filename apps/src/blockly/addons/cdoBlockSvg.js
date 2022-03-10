import GoogleBlockly from 'blockly/core';

// Should be able to remove when we remove not allowing disconnecting from child block.
GoogleBlockly.BlockSvg.prototype.canDisconnectFromParent_ = true;

// I *think* this can be moved to a helper.
const oldMixin = GoogleBlockly.BlockSvg.prototype.mixin;
GoogleBlockly.BlockSvg.prototype.mixin = function(mixinObj, opt_disableCheck) {
  oldMixin.call(this, mixinObj, true);
};

// Should be able to remove when we remove not allowing disconnecting from child block.
GoogleBlockly.BlockSvg.prototype.setCanDisconnectFromParent = function(
  canDisconnect
) {
  this.canDisconnectFromParent_ = canDisconnect;
};

// This is actually allowed and I believe what we would expect.
GoogleBlockly.BlockSvg.prototype.customContextMenu = function(menuOptions) {
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
      text: this.movable_ ? 'Make Immovable to Users' : 'Make Movable to Users',
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
};

// internal to code.org.
GoogleBlockly.BlockSvg.prototype.isUserVisible = function() {
  return false;
};

// Should be able to remove when we remove not allowing disconnecting from child block.
const oldMouseDown = GoogleBlockly.BlockSvg.prototype.onMouseDown_;
GoogleBlockly.BlockSvg.prototype.onMouseDown_ = function(e) {
  if (!Blockly.utils.isRightButton(e) && !this.canDisconnectFromParent_) {
    return;
  }
  oldMouseDown.call(this, e);
};

// Util? Not sure what this does other than gives it a different name.
GoogleBlockly.BlockSvg.prototype.getHexColour = function() {
  return this.getColour();
};

// TODO: Figure out how to giv it the correct IDs
// export default class BlockSvg extends GoogleBlockly.BlockSvg {
//   constructor(workspace, prototypeName, opt_id) {
//     super(workspace, prototypeName, ++Blockly.uidCounter_); // Use counter instead of randomly generated IDs

//     this.canDisconnectFromParent_ = true;
//   }
// }
