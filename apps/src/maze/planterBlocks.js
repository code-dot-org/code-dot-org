/**
 * Blocks specific to Planter
 */
var msg = require('./locale');
var blockUtils = require('../block_utils');

exports.install = function(blockly, blockInstallOptions) {
  var generator = blockly.getGenerator();
  blockly.JavaScript = generator;

  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'planter_plant',
    helpUrl: '',
    title: msg.plant(),
    titleImage: undefined,
    tooltip: msg.plantTooltip(),
    functionName: 'Maze.plant'
  });

  blockly.Blocks.planter_ifAtSoil = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(
        [msg.ifCode(), msg.at(), msg.soil()].join(' ')
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.planter_ifAtSoil = function() {
    var argument = `Maze.atSoil('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    var code = `if (${argument}) {\n${branch}}\n`;
    return code;
  };

  blockly.Blocks.planter_ifAtSprout = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(
        [msg.ifCode(), msg.at(), msg.sprout()].join(' ')
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.planter_ifAtSprout = function() {
    var argument = `Maze.atSprout('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    var code = `if (${argument}) {\n${branch}}\n`;
    return code;
  };
};
