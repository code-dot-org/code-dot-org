var msg = require('./locale');
var blockUtils = require('../block_utils');

exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  var generator = blockly.getGenerator();
  blockly.JavaScript = generator;

  // Block for collecting collectibles. Comes in both regular and K1
  // versions
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'collector_collect',
    helpUrl: '',
    title: isK1 ? msg.get() : msg.collect(),
    titleImage: isK1 ? skin.collectBlock : undefined,
    tooltip: msg.collectorCollectTooltip(),
    functionName: 'Maze.collect'
  });

  // simplified collector block. For when you want a K1 block in a
  // non-K1 level.
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'collector_collect_simplified',
    helpUrl: '',
    title: msg.get(),
    titleImage: skin.collectBlock,
    tooltip: msg.collectorCollectTooltip(),
    functionName: 'Maze.collect'
  });

  // Block for 'if' conditional if there is a collectible
  blockly.Blocks.collector_ifCollectible = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(
        msg.ifCode() + ' ' + msg.collectiblePresent()
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setTooltip(msg.ifTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.collector_ifCollectible = function() {
    var argument = `Maze.pilePresent('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    var code = `if (${argument}) {\n${branch}}\n`;
    return code;
  };

  // Block for 'while' conditional if there is a collectible
  blockly.Blocks.collector_whileCollectible = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function() {
      this.setHSV(322, 0.9, 0.95);
      this.appendDummyInput().appendTitle(
        msg.whileMsg() + ' ' + msg.collectiblePresent()
      );
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.collector_whileCollectible = function() {
    var argument = `Maze.pilePresent('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    return `while (${argument}) {\n${branch}}\n`;
  };
};
