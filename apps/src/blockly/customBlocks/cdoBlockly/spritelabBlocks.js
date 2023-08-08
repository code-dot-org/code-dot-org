// This file contains customizations to CDO Blockly Sprite Lab blocks.

export const blocks = {
  // Called by block_utils when creating Sprite Lab blocks with mini-toolboxes.
  initializeMiniToolbox(miniToolboxBlocks) {
    {
      var toggle = new Blockly.FieldIcon('+');
      if (Blockly.cdoUtils.isWorkspaceReadOnly(this.blockSpace)) {
        toggle.setReadOnly();
      }
      var miniToolboxXml = '<xml>';
      miniToolboxBlocks.forEach(block => {
        miniToolboxXml += `\n <block type="${block}"></block>`;
      });
      miniToolboxXml += '\n</xml>';
      // Block.isMiniFlyoutOpen is used in the blockly repo to track whether or not the horizontal flyout is open.
      this.isMiniFlyoutOpen = false;
      // On button click, open/close the horizontal flyout, toggle button text between +/-, and re-render the block.
      Blockly.cdoUtils.bindBrowserEvent(
        toggle.fieldGroup_,
        'mousedown',
        this,
        () => {
          if (Blockly.cdoUtils.isWorkspaceReadOnly(this.blockSpace)) {
            return;
          }
          if (this.isMiniFlyoutOpen) {
            toggle.setValue('+');
          } else {
            toggle.setValue('-');
          }
          this.isMiniFlyoutOpen = !this.isMiniFlyoutOpen;
          this.render();
          // If the mini flyout just opened, make sure mini-toolbox blocks are updated with the right thumbnails.
          // This has to happen after render() because some browsers don't render properly if the elements are not
          // visible. The root cause is that getComputedTextLength returns 0 if a text element is not visible, so
          // the thumbnail image overlaps the label in Firefox, Edge, and IE.
          if (this.isMiniFlyoutOpen) {
            let miniToolboxBlocks = this.miniFlyout.blockSpace_.topBlocks_;
            let rootInputBlocks = this.getConnections_(true /* all */)
              .filter(function (connection) {
                return connection.type === Blockly.INPUT_VALUE;
              })
              .map(function (connection) {
                return connection.targetBlock();
              });
            miniToolboxBlocks.forEach(function (block, index) {
              block.shadowBlockValue_(rootInputBlocks[index]);
            });
          }
        }
      );
      this.appendDummyInput().appendField(toggle, 'toggle').appendField(' ');
      this.initMiniFlyout(miniToolboxXml);
    }
  },
  // All of the work to create the flyout is handled by initializeMiniToolbox
  // This is just needed by block_utils when using the Google Blockly Wrapper.
  appendMiniToolboxToggle() {},

  // Set up this block to shadow an image source block's image, if needed.
  setUpBlockShadowing() {
    switch (this.type) {
      case 'gamelab_clickedSpritePointer':
        this.setBlockToShadow(
          root =>
            root.type === 'gamelab_spriteClicked' &&
            root.getConnections_()[1] &&
            root.getConnections_()[1].targetBlock()
        );
        break;
      case 'gamelab_newSpritePointer':
        this.setBlockToShadow(
          root =>
            root.type === 'gamelab_whenSpriteCreated' &&
            root.getConnections_()[1] &&
            root.getConnections_()[1].targetBlock()
        );
        break;
      case 'gamelab_subjectSpritePointer':
        this.setBlockToShadow(
          root =>
            root.type === 'gamelab_checkTouching' &&
            root.getConnections_()[1] &&
            root.getConnections_()[1].targetBlock()
        );
        break;
      case 'gamelab_objectSpritePointer':
        this.setBlockToShadow(
          root =>
            root.type === 'gamelab_checkTouching' &&
            root.getConnections_()[2] &&
            root.getConnections_()[2].targetBlock()
        );
        break;
      default:
        // Not a pointer block, so no block to shadow
        break;
    }
  },
};
