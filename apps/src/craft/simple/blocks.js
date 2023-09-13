import i18n from '../locale';
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
  'wool',
];

const toExport = {};

// Install extensions to Blockly's language and JavaScript generator.
toExport.install = function (blockly, blockInstallOptions) {
  var dropdownBlocks = (blockInstallOptions.level.availableBlocks || []).concat(
    JSON.parse(window.localStorage.getItem('craftPlayerInventory')) || []
  );

  var dropdownBlockSet = {};

  dropdownBlocks.forEach(function (type) {
    dropdownBlockSet[type] = true;
  });

  var craftBlockOptions = {
    inventoryBlocks: Object.keys(dropdownBlockSet),
    ifBlockOptions: blockInstallOptions.level.ifBlockOptions,
    placeBlockOptions: blockInstallOptions.level.placeBlockOptions,
  };

  var inventoryBlocksEmpty =
    !craftBlockOptions.inventoryBlocks ||
    craftBlockOptions.inventoryBlocks.length === 0;
  var allDropdownBlocks = inventoryBlocksEmpty
    ? allBlocks
    : craftBlockOptions.inventoryBlocks;

  blockly.Blocks.craft_moveForward = {
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      this.appendDummyInput().appendField(
        new blockly.FieldLabel(i18n.blockMoveForward())
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_moveForward = function () {
    return "moveForward('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_turn = {
    // Block for turning left or right.
    helpUrl: 'http://code.google.com/p/blockly/wiki/Turn',
    init: function () {
      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      this.appendDummyInput().appendField(
        new blockly.FieldDropdown(this.DIRECTIONS),
        'DIR'
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.Blocks.craft_turn.DIRECTIONS = [
    [i18n.blockTurnLeft() + ' \u21BA', 'left'],
    [i18n.blockTurnRight() + ' \u21BB', 'right'],
  ];

  blockly.getGenerator().craft_turn = function () {
    // Generate JavaScript for turning left or right.
    var dir = this.getFieldValue('DIR');
    var methodCall = dir === 'left' ? 'turnLeft' : 'turnRight';
    return methodCall + "('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_destroyBlock = {
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      this.appendDummyInput().appendField(
        new blockly.FieldLabel(i18n.blockDestroyBlock())
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_destroyBlock = function () {
    return "destroyBlock('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_shear = {
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      this.appendDummyInput().appendField(
        new blockly.FieldLabel(i18n.blockShear())
      );
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_shear = function () {
    return "shear('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_ifBlockAhead = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = blockTypesToDropdownOptions(
        craftBlockOptions.ifBlockOptions || allDropdownBlocks
      );
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);
      Blockly.cdoUtils.setHSV(this, 196, 1.0, 0.79);
      this.appendDummyInput()
        .appendField(i18n.blockIf())
        .appendField(dropdown, 'TYPE')
        .appendField(i18n.blockWhileXAheadAhead());
      this.appendStatementInput('DO').appendField(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_ifBlockAhead = function () {
    var innerCode = blockly.getGenerator().statementToCode(this, 'DO');
    var blockType = this.getFieldValue('TYPE');
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
    init: function () {
      Blockly.cdoUtils.setHSV(this, 196, 1.0, 0.79);
      this.appendDummyInput().appendField(i18n.blockIfLavaAhead());
      this.appendStatementInput('DO').appendField(i18n.blockWhileXAheadDo());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_ifLavaAhead = function () {
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
    init: function () {
      var dropdownOptions = blockTypesToDropdownOptions(
        craftBlockOptions.placeBlockOptions || allDropdownBlocks
      );
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      this.appendDummyInput()
        .appendField(i18n.blockPlaceXPlace())
        .appendField(dropdown, 'TYPE');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_placeBlock = function () {
    var blockType = this.getFieldValue('TYPE');
    return 'placeBlock("' + blockType + '", \'block_id_' + this.id + "');\n";
  };

  blockly.Blocks.craft_placeTorch = {
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      this.appendDummyInput().appendField(i18n.blockPlaceTorch());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_placeTorch = function () {
    return "placeTorch('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_plantCrop = {
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      this.appendDummyInput().appendField(i18n.blockPlantCrop());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_plantCrop = function () {
    return "plantCrop('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_tillSoil = {
    helpUrl: '',
    init: function () {
      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      this.appendDummyInput().appendField(i18n.blockTillSoil());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_tillSoil = function () {
    return "tillSoil('block_id_" + this.id + "');\n";
  };

  blockly.Blocks.craft_placeBlockAhead = {
    helpUrl: '',
    init: function () {
      var dropdownOptions = blockTypesToDropdownOptions(
        craftBlockOptions.placeBlockOptions || allDropdownBlocks
      );
      var dropdown = new blockly.FieldDropdown(dropdownOptions);
      dropdown.setValue(dropdownOptions[0][1]);

      Blockly.cdoUtils.setHSV(this, 184, 1.0, 0.74);
      this.appendDummyInput()
        .appendField(i18n.blockPlaceXAheadPlace())
        .appendField(dropdown, 'TYPE')
        .appendField(i18n.blockPlaceXAheadAhead());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    },
  };

  blockly.getGenerator().craft_placeBlockAhead = function () {
    var blockType = this.getFieldValue('TYPE');
    return (
      'placeBlockAhead("' + blockType + '", \'block_id_' + this.id + "');\n"
    );
  };
};

export {toExport as default};
