import GoogleBlockly from 'blockly/core';

/**
 * Example method that moved the registerDeletable from BlockSvg
 * customContextMenu to here.
 */
 const registerDeletable = function() {
    /** @type {!GoogleBlockly.ContextMenuRegistry.RegistryItem} */
    const deletableOption = {
      displayText: function(scope) {
        // isDeletale is a built in Blockly function that checks whether the block
        // is deletable, is not a shadow, and if the workspace is readonly.
        const displayText = scope.block.isDeletable()
        ? 'Make Undeletable to Users'
        : 'Make Deletable to Users',
        return displayText;
      },
      preconditionFn: function() {
        if (Blockly.isStartMode) {
          return 'enabled';
        }
        return 'hidden';
      },
      callback: function(/** @type {!GoogleBlockly.ContextMenuRegistry.Scope} */
                         scope) {
        scope.block.setDeletable(!this.isDeletable());
      },
      scopeType: GoogleBlockly.ContextMenuRegistry.ScopeType.BLOCK,
      id: 'blockDeletable',
      weight: 1,
    };
    GoogleBlockly.ContextMenuRegistry.registry.register(deletableOption);
  };

const registerAllContextMenuItems = function() {
    registerDeletable();
}
exports.registerAllContextMenuItems = registerAllContextMenuItems;
  