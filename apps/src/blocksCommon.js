/**
 * Defines blocks useful in multiple blockly apps
 */

import {nonnegativeIntegerValidator} from '@cdo/apps/blockly/utils';
import commonMsg from '@cdo/locale';

import {BLOCK_TYPES, BlockStyles} from './blockly/constants';
import {
  addSerializationHooksToBlock,
  copyBlockGenerator,
  defineNewBlockGenerator,
} from './blockly/utils';

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
  // The custom block supports the US English spelling of "color"
  installCustomColourRandomBlock(blockly);
};
function installControlsRepeatSimplified(blockly, skin) {
  // Re-uses the repeat block generator from core
  copyBlockGenerator(
    blockly.JavaScript,
    'controls_repeat_simplified',
    'controls_repeat'
  );
  copyBlockGenerator(
    blockly.JavaScript,
    'controls_repeat_simplified_dropdown',
    'controls_repeat'
  );

  blockly.Blocks.controls_repeat_simplified = {
    // Repeat n times (internal number) with simplified UI
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      this.setStyle(BlockStyles.LOOP);
      this.appendDummyInput()
        .appendField(
          blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT || commonMsg.repeat()
        )
        .appendField(
          new blockly.FieldTextInput('10', nonnegativeIntegerValidator),
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
      this.setStyle(BlockStyles.LOOP);
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
  copyBlockGenerator(
    blockly.JavaScript,
    'controls_repeat_dropdown',
    'controls_repeat'
  );

  blockly.Blocks.controls_repeat_dropdown = {
    // Repeat n times (internal number) with a customizable dropdown of # choices.
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      this.setStyle(BlockStyles.LOOP);
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
  copyBlockGenerator(blockly.JavaScript, 'math_number_dropdown', 'math_number');

  blockly.Blocks.math_number_dropdown = {
    // Numeric value with a customizable dropdown.
    init: function () {
      this.setHelpUrl(blockly.Msg.MATH_NUMBER_HELPURL);
      this.setStyle(BlockStyles.MATH);
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
      this.setStyle(BlockStyles.LOOP);
      // Not localized as this is only used by level builders
      this.appendDummyInput().appendField(
        'Pick one (Use only in required blocks)'
      );
      this.appendStatementInput('PICK');
    },
  };
  defineNewBlockGenerator(blockly.JavaScript, 'pick_one', () => {
    return '\n';
  });
}

// A "Category" block for level editing, for delineating category groups.
function installCategory(blockly) {
  blockly.Blocks.category = {
    // Repeat n times (internal number).
    init: function () {
      this.setStyle(BlockStyles.LOOP);
      this.setInputsInline(true);

      // Not localized as this is only used by level builders
      this.appendDummyInput()
        .appendField('Category')
        .appendField(new blockly.FieldTextInput('Name'), 'CATEGORY');
      this.setPreviousStatement(false);
      this.setNextStatement(false);
    },
  };
  defineNewBlockGenerator(blockly.JavaScript, 'category', () => {
    return '\n';
  });

  blockly.Blocks.custom_category = {
    // Repeat n times (internal number).
    init: function () {
      this.setStyle(BlockStyles.LOOP);
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

  defineNewBlockGenerator(blockly.JavaScript, 'custom_category', () => {
    return '\n';
  });
}

function installWhenRun(blockly, skin, isK1) {
  blockly.Blocks.when_run = {
    // Block to handle event where mouse is clicked
    helpUrl: '',
    init: function () {
      this.setStyle(BlockStyles.SETUP);
      if (isK1) {
        this.appendDummyInput()
          .appendField(commonMsg.whenRun())
          .appendField(new blockly.FieldImage(skin.runArrow, 22, 26));
      } else {
        this.appendDummyInput().appendField(commonMsg.whenRun());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
      addSerializationHooksToBlock(this);
    },
    shouldBeGrayedOut: function () {
      return false;
    },
  };

  defineNewBlockGenerator(blockly.JavaScript, 'when_run', () => {
    // Generate JavaScript for handling click event.
    return '\n';
  });
}

function installJoinBlock(blockly) {
  // text_join is included with core Blockly. We register a custom text_join_mutator
  // which adds the plus/minus block UI.
  blockly.Blocks.text_join_simple = blockly.Blocks.text_join;
  blockly.JavaScript.forBlock.text_join_simple =
    blockly.JavaScript.forBlock.text_join;
}
function installCustomColourRandomBlock(blockly) {
  // We need to use a custom block so that English users will see "random color".
  delete blockly.Blocks['colour_random'];
  blockly.common.defineBlocks(
    blockly.common.createBlockDefinitionsFromJsonArray([
      {
        type: BLOCK_TYPES.colourRandom,
        message0: commonMsg?.colourRandom?.() || 'random color',
        output: 'Colour',
        style: 'colour_blocks',
      },
    ])
  );
}

function installCommentBlock(blockly) {
  blockly.Blocks.comment = {
    init: function () {
      // Comment blocks use a hard-coded HSV color and are not compatible with themes.
      this.setStyle(BlockStyles.COMMENT);
      this.appendDummyInput()
        .appendField(commonMsg.commentPrefix())
        .appendField(new Blockly.FieldTextInput(''), 'TEXT');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(commonMsg.commentTooltip());
    },
  };

  defineNewBlockGenerator(blockly.JavaScript, 'comment', function () {
    var comment = this.getFieldValue('TEXT');
    return `// ${comment}\n`;
  });
}
