/**
 * Defines blocks useful in multiple blockly apps
 */
var commonMsg = require('@cdo/locale');

/**
 * Install extensions to Blockly's language and JavaScript generator
 * @param blockly instance of Blockly
 */
exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  installControlsRepeatSimplified(blockly, skin);
  installControlsRepeatDropdown(blockly);
  installNumberDropdown(blockly);
  installPickOne(blockly);
  installCategory(blockly);
  installWhenRun(blockly, skin, isK1);
  installJoinBlock(blockly);
  installCommentBlock(blockly);
};

function installControlsRepeatSimplified(blockly, skin) {
  // Re-uses the repeat block generator from core
  blockly.JavaScript.controls_repeat_simplified = blockly.JavaScript.controls_repeat;
  blockly.JavaScript.controls_repeat_simplified_dropdown = blockly.JavaScript.controls_repeat;

  blockly.Blocks.controls_repeat_simplified = {
    // Repeat n times (internal number) with simplified UI
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT)
        .appendTitle(new blockly.FieldTextInput('10', blockly.FieldTextInput.nonnegativeIntegerValidator), 'TIMES');
      this.appendStatementInput('DO')
        .appendTitle(new blockly.FieldImage(skin.repeatImage));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    }
  };

  blockly.Blocks.controls_repeat_simplified_dropdown = {
    // Repeat n times (internal number) with simplified UI
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT)
        .appendTitle(new blockly.FieldDropdown(), 'TIMES');
      this.appendStatementInput('DO')
        .appendTitle(new blockly.FieldImage(skin.repeatImage));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    }
  };
}

function installControlsRepeatDropdown(blockly) {
  blockly.JavaScript.controls_repeat_dropdown = blockly.JavaScript.controls_repeat;

  blockly.Blocks.controls_repeat_dropdown = {
    // Repeat n times (internal number) with a customizable dropdown of # choices.
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT)
        .appendTitle(new blockly.FieldDropdown(), 'TIMES')
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_TITLE_TIMES);
      this.appendStatementInput('DO')
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    }
  };
}

function installNumberDropdown(blockly) {
  blockly.JavaScript.math_number_dropdown = blockly.JavaScript.math_number;

  blockly.Blocks.math_number_dropdown = {
    // Numeric value with a customizable dropdown.
    init: function () {
      this.setHelpUrl(blockly.Msg.MATH_NUMBER_HELPURL);
      this.setHSV(258, 0.35, 0.62);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(), 'NUM');
      this.setOutput(true, Blockly.BlockValueType.NUMBER);
      this.setTooltip(blockly.Msg.MATH_NUMBER_TOOLTIP);
    }
  };
}

// A "Pick 1" block for level editing, where you want to require that one of a
// set of blocks is used.
function installPickOne(blockly) {
  blockly.Blocks.pick_one = {
    // Repeat n times (internal number).
    init: function () {
      this.setHSV(322, 0.90, 0.95);

      // Not localized as this is only used by level builders
      this.appendDummyInput()
          .appendTitle('Pick one (Use only in required blocks)');
      this.appendStatementInput('PICK');
    }
  };

  blockly.JavaScript.pick_one = function () {
    return '\n';
  };
}

// A "Category" block for level editing, for delineating category groups.
function installCategory(blockly) {
  blockly.Blocks.category = {
    // Repeat n times (internal number).
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.setInputsInline(true);

      // Not localized as this is only used by level builders
      this.appendDummyInput()
        .appendTitle('Category')
        .appendTitle(new blockly.FieldTextInput('Name'), 'CATEGORY');
      this.setPreviousStatement(false);
      this.setNextStatement(false);
    }
  };

  blockly.JavaScript.category = function () {
    return '\n';
  };
}

function installWhenRun(blockly, skin, isK1) {
  blockly.Blocks.when_run = {
    // Block to handle event where mouse is clicked
    helpUrl: '',
    init: function () {
      this.setHSV(39, 1.00, 0.99);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.whenRun())
          .appendTitle(new blockly.FieldImage(skin.runArrow, 22, 26));
      } else {
        this.appendDummyInput().appendTitle(commonMsg.whenRun());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
    },
    shouldBeGrayedOut: function () {
      return false;
    }
  };

  blockly.JavaScript.when_run = function () {
    // Generate JavaScript for handling click event.
    return '\n';
  };
}

function installJoinBlock(blockly) {
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
          }.bind(this)
        }
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
            input.appendTitle(commonMsg.joinText());
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
            () => this.setInputCount(lastConnectionIndex + 1), 100);
      }
    },
  };

  blockly.JavaScript.text_join_simple = function () {
    var parts = new Array(this.inputCount === '???' ? 2 : this.inputCount);
    for (var n = 0; n < this.inputCount; n++) {
      parts[n] = Blockly.JavaScript.valueToCode(this, 'ADD' + n,
          Blockly.JavaScript.ORDER_COMMA) || '\'\'';
    }
    var code = `[${ parts.join(',') }].join('')`;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };
}

function installCommentBlock(blockly) {
  blockly.Blocks.comment = {
    init: function () {
      this.setHSV(0, 0, 0.6);
      this.appendDummyInput()
        .appendTitle(commonMsg.commentPrefix())
        .appendTitle(new Blockly.FieldTextInput(''), 'TEXT');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(commonMsg.commentTooltip());
    }
  };

  blockly.JavaScript.comment = function () {
    var comment = this.getTitleValue('TEXT');
    return `// ${comment}\n`;
  };
}
