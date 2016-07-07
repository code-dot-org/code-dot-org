var msg = require('./locale');
var codegen = require('../codegen');
var blockUtils = require('../block_utils');

exports.install = function (blockly, blockInstallOptions) {
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  // Block for collecting collectibles
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'collector_collect',
    helpUrl: '',
    title: msg.collect(),
    tooltip: msg.collectorCollectTooltip(),
    functionName: 'Maze.dig'
  });

  // Block for 'if' conditional if there is a collectible
  blockly.Blocks.collector_ifCollectible = {
    helpUrl: '',
    init: function () {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(msg.ifCode() + ' ' + msg.collectiblePresent());
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setTooltip(msg.ifTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.collector_ifCollectible = function () {
    var argument = `Maze.pilePresent('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    var code = `if (${argument}) {\n${branch}}\n`;
    return code;
  };

  // Block for 'while' conditional if there is a collectible
  blockly.Blocks.collector_whileCollectible = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(msg.whileMsg() + ' ' + msg.collectiblePresent());
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.collector_whileCollectible = function () {
    var argument = `Maze.pilePresent('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + branch;
    return `while (${argument}) {\n${branch}}\n`;
  };
};
