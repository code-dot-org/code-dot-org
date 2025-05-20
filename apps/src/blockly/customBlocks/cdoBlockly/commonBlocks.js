/**
 * Defines blocks useful in multiple blockly apps
 */
var blockly = require('@code-dot-org/blockly');

var commonMsg = require('@cdo/locale');

export const blocks = {
  installJoinBlock(blockly) {
    blockly.Blocks.text_join_simple = {
      init: function () {
        this.helpUrl = '';
        this.setColour(160);
        this.setOutput(true, Blockly.BlockValueType.STRING);
        this.setTooltip(commonMsg.joinTextTooltip());
        this.inputCount = 0;
      },

      getCustomContextMenuItems: function () {
        return [
          {
            text: `Set number of inputs (current: ${this.inputCount})`,
            enabled: true,
            callback: function () {
              var ret = prompt('Number of inputs', this.inputCount);
              if (ret === '???') {
                this.setInputCount(ret);
              } else if (ret !== '') {
                this.setInputCount(parseInt(ret));
              }
            }.bind(this),
          },
        ];
      },

      setInputCount: function (inputCount) {
        let newInputCount;
        if (inputCount === '???') {
          newInputCount = 2;
        } else {
          newInputCount = Math.max(parseInt(inputCount), 2);
        }
        if (newInputCount > this.inputCount) {
          for (var i = this.inputCount; i < newInputCount; i++) {
            var input = this.appendValueInput('ADD' + i);
            if (i === 0) {
              input.appendField(commonMsg.joinText());
            }
          }
        } else {
          for (i = this.inputCount - 1; i >= newInputCount; i--) {
            this.removeInput('ADD' + i);
          }
        }
        if (inputCount === '???') {
          this.inputCount = inputCount;
        } else {
          this.inputCount = newInputCount;
        }
      },

      pendingConnection: function (oldConnection, newConnection) {
        var lastConnectionIndex = 0;
        var oldConnectionIndex = -1;
        var newConnectionIndex = -1;
        for (var i = 0; i < this.inputList.length; i++) {
          var connection = this.inputList[i].connection;
          if (connection.targetConnection) {
            lastConnectionIndex = i;
          }
          if (connection === oldConnection) {
            oldConnectionIndex = i;
          }
          if (connection === newConnection) {
            newConnectionIndex = i;
          }
        }

        var toEnd = newConnectionIndex >= lastConnectionIndex;
        var fromEnd = oldConnectionIndex >= lastConnectionIndex;

        if (this.delayedResize && toEnd ^ fromEnd) {
          window.clearTimeout(this.delayedResize);
          this.delayedResize = null;
        }
        if (toEnd && !fromEnd) {
          this.setInputCount(lastConnectionIndex + 2);
        } else if (fromEnd && !toEnd) {
          this.delayedResize = window.setTimeout(
            () => this.setInputCount(lastConnectionIndex + 1),
            100
          );
        }
      },
    };

    blockly.JavaScript.text_join_simple = function () {
      var parts = new Array(this.inputCount === '???' ? 2 : this.inputCount);
      for (var n = 0; n < this.inputCount; n++) {
        parts[n] =
          Blockly.JavaScript.valueToCode(
            this,
            'ADD' + n,
            Blockly.JavaScript.ORDER_COMMA
          ) || "''";
      }
      var code = `[${parts.join(',')}].join('')`;
      return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
    };
  },
  installCustomColourRandomBlock() {},
  copyBlockGenerator(generator, type1, type2) {
    generator[type1] = generator[type2];
  },
  defineNewBlockGenerator(generator, type, generatorFunction) {
    generator[type] = generatorFunction;
  },
  addSerializationHooksToBlock() {},
  mathRandomIntGenerator: blockly.JavaScript.math_random_int,
  getColourDropdownField(colours) {
    return new Blockly.FieldColourDropdown(colours, 45, 35);
  },
  // Used for functions and blocks with mini-toolboxes.
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
};
