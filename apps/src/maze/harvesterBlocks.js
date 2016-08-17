/**
 * Blocks specific to Harvester
 */

var msg = require('./locale');
var codegen = require('../codegen');
var blockUtils = require('../block_utils');

const CROPS = ['corn', 'pumpkin', 'wheat'];

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function addIfAtCropBlock(blockly, generator, crop) {
  blockly.Blocks[`harvester_ifAt${capitalizeFirstLetter(crop)}`] = {
    helpUrl: '',
    init: function () {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(msg.ifCode());
      this.appendDummyInput()
          .appendTitle(`${msg.at()} ${msg[crop]()}`);
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator[`harvester_ifAt${capitalizeFirstLetter(crop)}`] = function () {
    var argument = `Maze.at${capitalizeFirstLetter(crop)}('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    var code = `if (${argument}) {\n${branch}}\n`;
    return code;
  };
}

function addIfAtCropElseBlock(blockly, generator, crop) {
}

function addIfCropHasBlock(blockly, generator, crop) {
}

function addWhileCropHasBlock(blockly, generator, crop) {
}

exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  CROPS.forEach(crop => {
    // harvest crop
    blockUtils.generateSimpleBlock(blockly, generator, {
      name: `harvester_${crop}`,
      helpUrl: '',
      title: isK1 ? msg.get() : `${msg.get()} ${msg[crop]()}`,
      titleImage: isK1 ? skin[crop] : undefined,
      tooltip: msg[`${crop}Tooltip`](),
      functionName: `Maze.get${capitalizeFirstLetter(crop)}`
    });

    addIfAtCropBlock(blockly, generator, crop);
    addIfAtCropElseBlock(blockly, generator, crop);
    addIfCropHasBlock(blockly, generator, crop);
    addWhileCropHasBlock(blockly, generator, crop);
  });
};
