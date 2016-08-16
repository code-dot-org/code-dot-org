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

exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  CROPS.forEach(crop => {
    blockUtils.generateSimpleBlock(blockly, generator, {
      name: `harvester_${crop}`,
      helpUrl: '',
      title: isK1 ? msg.get() : `${msg.get()} ${msg[crop]()}`,
      titleImage: isK1 ? skin[crop] : undefined,
      tooltip: msg[`${crop}Tooltip`](),
      functionName: `Maze.get${capitalizeFirstLetter(crop)}`
    });

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
  });

  //addIfOnlyFlower(blockly, generator);
  //addIfFlowerHive(blockly, generator);
  //addIfElseFlowerHive(blockly, generator);

  //addConditionalComparisonBlock(blockly, generator, 'bee_ifNectarAmount', 'if',
  //  [[msg.nectarRemaining(), 'nectarRemaining'],
  //   [msg.honeyAvailable(), 'honeyAvailable']]);

  //addConditionalComparisonBlock(blockly, generator, 'bee_ifelseNectarAmount', 'ifelse',
  //  [[msg.nectarRemaining(), 'nectarRemaining'],
  //   [msg.honeyAvailable(), 'honeyAvailable']]);

  //addConditionalComparisonBlock(blockly, generator, 'bee_ifTotalNectar', 'if',
  //  [[msg.totalNectar(), 'nectarCollected'],
  //   [msg.totalHoney(), 'honeyCreated']]);

  //addConditionalComparisonBlock(blockly, generator, 'bee_ifelseTotalNectar', 'ifelse',
  //  [[msg.totalNectar(), 'nectarCollected'],
  //   [msg.totalHoney(), 'honeyCreated']]);

  //addConditionalComparisonBlock(blockly, generator, 'bee_whileNectarAmount', 'while',
  //  [[msg.nectarRemaining(), 'nectarRemaining'],
  //   [msg.honeyAvailable(), 'honeyAvailable']]);

  //blockUtils.generateSimpleBlock(blockly, generator, {
  //  name: 'maze_honey',
  //  helpUrl: '',
  //  title: isK1 ? msg.make() : msg.honey(),
  //  titleImage: isK1 ? skin.honey : undefined,
  //  tooltip: msg.honeyTooltip(),
  //  functionName: 'Maze.makeHoney'
  //});
};
