var i18n = require('../locale');
import {blockTypesToDropdownOptions} from '../utils';

var allBlocks = [
  'bedrock',
  'bricks',
  'clay',
  'oreCoal',
  'dirtCoarse',
  'cobblestone',
  'oreDiamond',
  'dirt',
  'oreEmerald',
  'farmlandWet',
  'glass',
  'oreGold',
  'grass',
  'gravel',
  'clayHardened',
  'oreIron',
  'oreLapis',
  'lava',
  'logAcacia',
  'logBirch',
  'logJungle',
  'logOak',
  'logSpruce',
  'planksAcacia',
  'planksBirch',
  'planksJungle',
  'planksOak',
  'planksSpruce',
  'oreRedstone',
  'sand',
  'sandstone',
  'stone',
  'tnt',
  'tree',
  'wool'
];

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var dropdownBlocks = (blockInstallOptions.level.availableBlocks || []).concat(
    JSON.parse(window.localStorage.getItem('craftPlayerInventory')) || []
  );

  var dropdownBlockSet = {};

  dropdownBlocks.forEach(function(type) {
    dropdownBlockSet[type] = true;
  });

  var craftBlockOptions = {
    inventoryBlocks: Object.keys(dropdownBlockSet),
    ifBlockOptions: blockInstallOptions.level.ifBlockOptions,
    placeBlockOptions: blockInstallOptions.level.placeBlockOptions
  };

  var inventoryBlocksEmpty =
    !craftBlockOptions.inventoryBlocks ||
    craftBlockOptions.inventoryBlocks.length === 0;
  var allDropdownBlocks = inventoryBlocksEmpty
    ? allBlocks
    : craftBlockOptions.inventoryBlocks;

  blockly.Blocks.craft_moveForward = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockMoveForward())
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.getGenerator().craft_moveForward = function() {
    return "moveForward('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_moveBackward = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockMoveBackward())
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.getGenerator().craft_moveBackward = function() {
    return "moveBackward('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_turn = {
    // Block for turning left or right.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.Blocks.craft_turn.DIRECTIONS = [
    [i18n.blockTurnLeft() + ' \u21BA', 'left'],
    [i18n.blockTurnRight() + ' \u21BB', 'right']
  ];

  blockly.getGenerator().craft_turn = function() {
    // Generate JavaScript for turning left or right.
    var dir = this.getTitleValue('DIR');
    var methodCall = dir === 'left' ? 'turnLeft' : 'turnRight';
    return methodCall + "('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_destroyBlock = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput().appendTitle(
        new blockly.FieldLabel(i18n.blockDestroyBlock())
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.getGenerator().craft_destroyBlock = function() {
    return "destroyBlock('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_ifBlockAhead = {
    helpUrl: '',
    init: function() {
      var dropdownOptions = blockTypesToDropdownOptions(
        craftBlockOptions.ifBlockOptions || allDropdownBlocks
      );
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
        .appendTitle(i18n.blockIf())
        .appendTitle(dropdown, 'TYPE')
        .appendTitle(i18n.blockWhileXAheadAhead());
      this.appendStatementInput('DO').appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.getGenerator().craft_ifBlockAhead = function() {
    var innerCode = blockly.getGenerator().statementToCode(this, 'DO');
    var blockType = this.getTitleValue('TYPE');
    return (
      'ifBlockAhead("' +
      blockType +
      '", function() {\n' +
      innerCode +
      "}, 'block_id_" +
      this.id +
      "');\n"
    );
  };

  blockly.Blocks.craft_ifLavaAhead = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(i18n.blockIfLavaAhead());
      this.appendStatementInput('DO').appendTitle(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.getGenerator().craft_ifLavaAhead = function() {
    var innerCode = blockly.getGenerator().statementToCode(this, 'DO');
    return (
      'ifLavaAhead(function() {\n' +
      innerCode +
      "}, 'block_id_" +
      this.id +
      "');\n"
    );
  };

  blockly.Blocks.craft_placeBlock = {
    helpUrl: '',
    init: function() {
      var dropdownOptions = blockTypesToDropdownOptions(
        craftBlockOptions.placeBlockOptions || allDropdownBlocks
      );
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput()
        .appendTitle(i18n.blockPlaceXPlace())
        .appendTitle(dropdown, 'TYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.getGenerator().craft_placeBlock = function() {
    var blockType = this.getTitleValue('TYPE');
    return 'placeBlock("' + blockType + '", \'block_id_' + this.id + "');\n";
  };

  const fourDirections = [
    [i18n.directionForward(), '0'],
    [i18n.directionBack(), '2'],
    [i18n.directionLeft(), '3'],
    [i18n.directionRight(), '1']
  ];

  blockly.Blocks.craft_placeBlockDirection = {
    helpUrl: '',
    init: function() {
      var dropdownOptions = blockTypesToDropdownOptions(
        craftBlockOptions.placeBlockOptions || allDropdownBlocks
      );
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      this.setHSV(184, 1.0, 0.74);
      this.appendDummyInput()
        .appendTitle(i18n.blockPlaceXPlace())
        .appendTitle(dropdown, 'TYPE')
        .appendTitle(' ')
        .appendTitle(new blockly.FieldDropdown(fourDirections), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  blockly.getGenerator().craft_placeBlockDirection = function() {
    var blockType = this.getTitleValue('TYPE');
    var direction = this.getTitleValue('DIR');
    return (
      'placeDirection("' +
      blockType +
      '", "' +
      direction +
      '", \'block_id_' +
      this.id +
      "');\n"
    );
  };
};
