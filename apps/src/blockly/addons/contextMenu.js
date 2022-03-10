/**
 * Option to undo previous action.
 * @alias Blockly.ContextMenuItems.registerUndo
 */
 const registerDeletable = function() {
    /** @type {!ContextMenuRegistry.RegistryItem} */
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
      callback: function(/** @type {!ContextMenuRegistry.Scope} */
                         scope) {
        scope.block.setDeletable(!this.isDeletable());
      },
      scopeType: ContextMenuRegistry.ScopeType.BLOCK,
      id: 'blockDeletable',
      weight: 1,
    };
    ContextMenuRegistry.registry.register(deletableOption);
  };

const registerAllContextMenuItems = function() {
    registerDeletable();
}
exports.registerAllContextMenuItems = registerAllContextMenuItems;
  