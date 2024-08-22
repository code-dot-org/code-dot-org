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
};
