/**
 * Defines blocks useful in multiple blockly apps
 */
var commonMsg = require('@cdo/locale');

var BlockStyles = require('./blockly/constants').BlockStyles;
var BlockColors = require('./blockly/constants').BlockColors;

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
  installCustomColourRandomBlock(blockly);
};

function installControlsRepeatSimplified(blockly, skin) {
  // Re-uses the repeat block generator from core
  blockly.customBlocks.copyBlockGenerator(
    blockly.JavaScript,
    'controls_repeat_simplified',
    'controls_repeat'
  );
  blockly.customBlocks.copyBlockGenerator(
    blockly.JavaScript,
    'controls_repeat_simplified_dropdown',
    'controls_repeat'
  );

  blockly.Blocks.controls_repeat_simplified = {
    // Repeat n times (internal number) with simplified UI
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );
      this.appendDummyInput()
        .appendField(
          blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT || commonMsg.repeat()
        )
        .appendField(
          new blockly.FieldTextInput(
            '10',
            blockly.cdoUtils.nonnegativeIntegerValidator
          ),
          'TIMES'
        );
      this.appendStatementInput('DO').appendField(
        new blockly.FieldImage(skin.repeatImage)
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    },
  };

  blockly.Blocks.controls_repeat_simplified_dropdown = {
    // Repeat n times (internal number) with simplified UI
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );
      this.appendDummyInput()
        .appendField(
          blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT || commonMsg.repeat()
        )
        .appendField(new blockly.FieldDropdown(), 'TIMES');
      this.appendStatementInput('DO').appendField(
        new blockly.FieldImage(skin.repeatImage)
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    },
  };
}

function installControlsRepeatDropdown(blockly) {
  blockly.customBlocks.copyBlockGenerator(
    blockly.JavaScript,
    'controls_repeat_dropdown',
    'controls_repeat'
  );

  blockly.Blocks.controls_repeat_dropdown = {
    // Repeat n times (internal number) with a customizable dropdown of # choices.
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );
      this.appendDummyInput()
        .appendField(
          blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT || commonMsg.repeat()
        )
        .appendField(new blockly.FieldDropdown(), 'TIMES')
        .appendField(
          blockly.Msg.CONTROLS_REPEAT_TITLE_TIMES || commonMsg.times()
        );
      this.appendStatementInput('DO').appendField(
        blockly.Msg.CONTROLS_REPEAT_INPUT_DO
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    },
  };
}

function installNumberDropdown(blockly) {
  blockly.customBlocks.copyBlockGenerator(
    blockly.JavaScript,
    'math_number_dropdown',
    'math_number'
  );

  blockly.Blocks.math_number_dropdown = {
    // Numeric value with a customizable dropdown.
    init: function () {
      this.setHelpUrl(blockly.Msg.MATH_NUMBER_HELPURL);
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.MATH,
        BlockStyles.MATH
      );
      this.appendDummyInput().appendField(new blockly.FieldDropdown(), 'NUM');
      this.setOutput(true, Blockly.BlockValueType.NUMBER);
      this.setTooltip(blockly.Msg.MATH_NUMBER_TOOLTIP);
    },
  };
}

// A "Pick 1" block for level editing, where you want to require that one of a
// set of blocks is used.
function installPickOne(blockly) {
  blockly.Blocks.pick_one = {
    // Repeat n times (internal number).
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );

      // Not localized as this is only used by level builders
      this.appendDummyInput().appendField(
        'Pick one (Use only in required blocks)'
      );
      this.appendStatementInput('PICK');
    },
  };
  Blockly.customBlocks.defineNewBlockGenerator(
    blockly.JavaScript,
    'pick_one',
    () => {
      return '\n';
    }
  );
}

// A "Category" block for level editing, for delineating category groups.
function installCategory(blockly) {
  blockly.Blocks.category = {
    // Repeat n times (internal number).
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );
      this.setInputsInline(true);

      // Not localized as this is only used by level builders
      this.appendDummyInput()
        .appendField('Category')
        .appendField(new blockly.FieldTextInput('Name'), 'CATEGORY');
      this.setPreviousStatement(false);
      this.setNextStatement(false);
    },
  };
  Blockly.customBlocks.defineNewBlockGenerator(
    blockly.JavaScript,
    'category',
    () => {
      return '\n';
    }
  );

  blockly.Blocks.custom_category = {
    // Repeat n times (internal number).
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.LOOP,
        BlockStyles.LOOP
      );
      this.setInputsInline(true);

      var customDropdown = new blockly.FieldDropdown([
        ['Variables', 'VARIABLE'],
        ['Functions', 'PROCEDURE'],
        ['Behaviors', 'Behavior'],
        ['Locations', 'Location'],
      ]);
      // Not localized as this is only used by level builders
      this.appendDummyInput()
        .appendField('Auto-populated Category')
        .appendField(customDropdown, 'CUSTOM');
      this.setPreviousStatement(false);
      this.setNextStatement(false);
    },
  };

  Blockly.customBlocks.defineNewBlockGenerator(
    blockly.JavaScript,
    'custom_category',
    () => {
      return '\n';
    }
  );
}

function installWhenRun(blockly, skin, isK1) {
  blockly.Blocks.when_run = {
    // Block to handle event where mouse is clicked
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.handleColorAndStyle(
        this,
        BlockColors.SETUP,
        BlockStyles.SETUP
      );
      if (isK1) {
        this.appendDummyInput()
          .appendField(commonMsg.whenRun())
          .appendField(new blockly.FieldImage(skin.runArrow, 22, 26));
      } else {
        this.appendDummyInput().appendField(commonMsg.whenRun());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      Blockly.customBlocks.addSerializationHooksToBlock(this);
    },
    shouldBeGrayedOut: function () {
      return false;
    },
  };

  Blockly.customBlocks.defineNewBlockGenerator(
    blockly.JavaScript,
    'when_run',
    () => {
      // Generate JavaScript for handling click event.
      return '\n';
    }
  );
}

function installJoinBlock(blockly) {
  Blockly.customBlocks.installJoinBlock(blockly);
}
function installCustomColourRandomBlock(blockly) {
  Blockly.customBlocks.installCustomColourRandomBlock(blockly);
}

function installCommentBlock(blockly) {
  blockly.Blocks.comment = {
    init: function () {
      // Comment blocks use a hard-coded HSV color and are not compatible with themes.
      Blockly.cdoUtils.handleColorAndStyle(this, BlockColors.COMMENT);
      this.appendDummyInput()
        .appendField(commonMsg.commentPrefix())
        .appendField(new Blockly.FieldTextInput(''), 'TEXT');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(commonMsg.commentTooltip());
    },
  };

  Blockly.customBlocks.defineNewBlockGenerator(
    blockly.JavaScript,
    'comment',
    function () {
      var comment = this.getFieldValue('TEXT');
      return `// ${comment}\n`;
    }
  );
}
