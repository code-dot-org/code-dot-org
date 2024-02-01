/**
 * Defines blocks useful in multiple blockly apps
 */
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
  copyBlockGenerator(generator, type1, type2) {
    generator[type1] = generator[type2];
  },
  defineNewBlockGenerator(generator, type, generatorFunction) {
    generator[type] = generatorFunction;
  },
  addSerializationHooksToBlock() {},
  mathRandomIntGenerator() {
    // Random integer between [X] and [Y].
    var argument0 =
      Blockly.JavaScript.valueToCode(
        this,
        'FROM',
        Blockly.JavaScript.ORDER_COMMA
      ) || '0';
    var argument1 =
      Blockly.JavaScript.valueToCode(
        this,
        'TO',
        Blockly.JavaScript.ORDER_COMMA
      ) || '0';
    if (!Blockly.JavaScript.definitions_['math_random_int']) {
      var functionName = Blockly.JavaScript.variableDB_.getDistinctName(
        'math_random_int',
        Blockly.Generator.NAME_TYPE
      );
      Blockly.JavaScript.math_random_int.random_function = functionName;
      var func = [];
      func.push('function ' + functionName + '(a, b) {');
      func.push('  if (a > b) {');
      func.push('    // Swap a and b to ensure a is smaller.');
      func.push('    var c = a;');
      func.push('    a = b;');
      func.push('    b = c;');
      func.push('  }');
      func.push('  return Math.floor(Math.random() * (b - a + 1) + a);');
      func.push('}');
      Blockly.JavaScript.definitions_['math_random_int'] = func.join('\n');
    }
    var code =
      Blockly.JavaScript.math_random_int.random_function +
      '(' +
      argument0 +
      ', ' +
      argument1 +
      ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  },
};
