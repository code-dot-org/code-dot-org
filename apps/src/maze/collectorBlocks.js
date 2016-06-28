var msg = require('./locale');
var codegen = require('../codegen');
var blockUtils = require('../block_utils');

exports.install = function (blockly, blockInstallOptions) {
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;
  // Block for putting for removing dirt from a tile.
  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'collector_collect',
    helpUrl: 'TODO',
    title: 'collect',
    tooltip: 'TODO',
    functionName: 'Maze.dig'
  });

  blockly.Blocks.collector_if = {
    // Block for 'if' conditional if there is a path.
    helpUrl: '',
    init: function () {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput()
          .appendTitle(msg.ifCode() + ' ' + msg.collectablePresent());
      this.setInputsInline(true);
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setTooltip(msg.ifTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.collector_if = function () {
    // Generate JavaScript for 'if' conditional if there is a path.
    var argument = 'Maze.pilePresent(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };

  blockly.Blocks.collector_whileNotClear = {
    helpUrl: 'http://code.google.com/p/blockly/wiki/Repeat',
    init: function () {
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
          .appendTitle(msg.whileMsg() + ' ' + msg.collectablePresent());
      this.appendStatementInput('DO')
          .appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(msg.whileTooltip());
    }
  };

  generator.collector_whileNotClear = function () {
    var argument = 'Maze.pilePresent(\'block_id_' + this.id + '\')';
    var branch = generator.statementToCode(this, 'DO');
    branch = codegen.loopTrap() + branch;
    return 'while (' + argument + ') {\n' + branch + '}\n';
  };


};
