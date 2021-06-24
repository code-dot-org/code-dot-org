/**
 * Blocks specific to Harvester
 */

var msg = require('./locale');
var blockUtils = require('../block_utils');

const CROPS = ['corn', 'pumpkin', 'lettuce'];

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function addIfAtSpecificCropBlock(blockly, generator, crop) {
  blockly.Blocks[`harvester_ifAt${capitalizeFirstLetter(crop)}`] = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(
        [msg.ifCode(), msg.at(), msg[crop]()].join(' ')
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator[`harvester_ifAt${capitalizeFirstLetter(crop)}`] = function() {
    var argument = `Maze.at${capitalizeFirstLetter(crop)}('block_id_${
      this.id
    }')`;
    var branch = generator.statementToCode(this, 'DO');
    var code = `if (${argument}) {\n${branch}}\n`;
    return code;
  };
}

function addIfAtSpecificCropElseBlock(blockly, generator, crop) {
  blockly.Blocks[`harvester_ifAt${capitalizeFirstLetter(crop)}Else`] = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(
        [msg.ifCode(), msg.at(), msg[crop]()].join(' ')
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator[`harvester_ifAt${capitalizeFirstLetter(crop)}Else`] = function() {
    var argument = `Maze.at${capitalizeFirstLetter(crop)}('block_id_${
      this.id
    }')`;
    var doCode = generator.statementToCode(this, 'DO');
    var elseCode = generator.statementToCode(this, 'ELSE');
    var code = `if (${argument}) {\n${doCode}} else {\n${elseCode}}\n`;
    return code;
  };
}

function addUntilAtSpecificCropBlock(blockly, generator, crop) {
  blockly.Blocks[`harvester_untilAt${capitalizeFirstLetter(crop)}`] = {
    helpUrl: '',
    init: function() {
      this.setHSV(322, 0.9, 0.95);
      this.appendDummyInput().appendTitle(
        [msg.repeatUntil(), msg.at(), msg[crop]()].join(' ')
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator[`harvester_untilAt${capitalizeFirstLetter(crop)}`] = function() {
    var atCrop = `Maze.at${capitalizeFirstLetter(crop)}('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    var code = `while (!${atCrop}) {\n${branch}}\n`;
    return code;
  };
}

function addIfSpecificCropHasBlock(blockly, generator, crop) {
  blockly.Blocks[`harvester_ifHas${capitalizeFirstLetter(crop)}`] = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(
        [msg.ifCode(), msg[`has${crop}`]()].join(' ')
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator[`harvester_ifHas${capitalizeFirstLetter(crop)}`] = function() {
    var argument = `Maze.has${capitalizeFirstLetter(crop)}('block_id_${
      this.id
    }')`;
    var branch = generator.statementToCode(this, 'DO');
    var code = `if (${argument}) {\n${branch}}\n`;
    return code;
  };
}

function addIfSpecificCropHasElseBlock(blockly, generator, crop) {
  blockly.Blocks[`harvester_ifHas${capitalizeFirstLetter(crop)}Else`] = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(
        [msg.ifCode(), msg[`has${crop}`]()].join(' ')
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator[`harvester_ifHas${capitalizeFirstLetter(crop)}Else`] = function() {
    var argument = `Maze.has${capitalizeFirstLetter(crop)}('block_id_${
      this.id
    }')`;
    var doCode = generator.statementToCode(this, 'DO');
    var elseCode = generator.statementToCode(this, 'ELSE');
    var code = `if (${argument}) {\n${doCode}} else {\n${elseCode}}\n`;
    return code;
  };
}

function addWhileSpecificCropHasBlock(blockly, generator, crop) {
  blockly.Blocks[`harvester_whileHas${capitalizeFirstLetter(crop)}`] = {
    helpUrl: '',
    init: function() {
      this.setHSV(322, 0.9, 0.95);
      this.appendDummyInput().appendTitle(
        [msg.whileMsg(), msg[`has${crop}`]()].join(' ')
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator[`harvester_whileHas${capitalizeFirstLetter(crop)}`] = function() {
    var argument = `Maze.has${capitalizeFirstLetter(crop)}('block_id_${
      this.id
    }')`;
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    var code = `while (${argument}) {\n${branch}}\n`;
    return code;
  };
}

function addUntilSpecificCropHasBlock(blockly, generator, crop) {
  blockly.Blocks[`harvester_untilHas${capitalizeFirstLetter(crop)}`] = {
    helpUrl: '',
    init: function() {
      this.setHSV(322, 0.9, 0.95);
      this.appendDummyInput().appendTitle(
        [msg.repeatUntil(), msg[`has${crop}`]()].join(' ')
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator[`harvester_untilHas${capitalizeFirstLetter(crop)}`] = function() {
    var argument = `Maze.has${capitalizeFirstLetter(crop)}('block_id_${
      this.id
    }')`;
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    var code = `while (!${argument}) {\n${branch}}\n`;
    return code;
  };
}

exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  var generator = blockly.getGenerator();
  blockly.JavaScript = generator;

  CROPS.forEach(crop => {
    // harvest crop
    blockUtils.generateSimpleBlock(blockly, generator, {
      name: `harvester_${crop}`,
      helpUrl: '',
      title: isK1 ? msg.pick() : `${msg.pick()} ${msg[crop]()}`,
      titleImage: isK1 ? skin[crop] : undefined,
      tooltip: msg[`${crop}Tooltip`](),
      functionName: `Maze.get${capitalizeFirstLetter(crop)}`
    });

    addIfAtSpecificCropBlock(blockly, generator, crop);
    addIfAtSpecificCropElseBlock(blockly, generator, crop);
    addUntilAtSpecificCropBlock(blockly, generator, crop);

    addIfSpecificCropHasBlock(blockly, generator, crop);
    addIfSpecificCropHasElseBlock(blockly, generator, crop);
    addUntilSpecificCropHasBlock(blockly, generator, crop);
    addWhileSpecificCropHasBlock(blockly, generator, crop);
  });

  const AT_OPTIONS = CROPS.map(crop => [
    msg[crop](),
    capitalizeFirstLetter(crop)
  ]);
  const HAS_OPTIONS = CROPS.map(crop => [
    msg[`has${crop}`](),
    capitalizeFirstLetter(crop)
  ]);

  blockly.Blocks.harvester_ifAtCrop = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle([msg.ifCode(), msg.at()].join(' '));
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(AT_OPTIONS),
        'LOC'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.harvester_ifAtCrop = function() {
    var argument = `Maze.at${this.getTitleValue('LOC')}('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    var code = `if (${argument}) {\n${branch}}\n`;
    return code;
  };

  blockly.Blocks.harvester_ifAtCropElse = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle([msg.ifCode(), msg.at()].join(' '));
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(AT_OPTIONS),
        'LOC'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.harvester_ifAtCropElse = function() {
    var argument = `Maze.at${this.getTitleValue('LOC')}('block_id_${this.id}')`;
    var doCode = generator.statementToCode(this, 'DO');
    var elseCode = generator.statementToCode(this, 'ELSE');
    var code = `if (${argument}) {\n${doCode}} else {\n${elseCode}}\n`;
    return code;
  };

  blockly.Blocks.harvester_untilAtCrop = {
    helpUrl: '',
    init: function() {
      this.setHSV(322, 0.9, 0.95);
      this.appendDummyInput().appendTitle(
        [msg.repeatUntil(), msg.at()].join(' ')
      );
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(AT_OPTIONS),
        'LOC'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.harvester_untilAtCrop = function() {
    var atCrop = `Maze.at${this.getTitleValue('LOC')}('block_id_${this.id}')`;
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    var code = `while (!${atCrop}) {\n${branch}}\n`;
    return code;
  };

  blockly.Blocks.harvester_ifHasCrop = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(HAS_OPTIONS),
        'LOC'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.harvester_ifHasCrop = function() {
    var argument = `Maze.has${this.getTitleValue('LOC')}('block_id_${
      this.id
    }')`;
    var branch = generator.statementToCode(this, 'DO');
    var code = `if (${argument}) {\n${branch}}\n`;
    return code;
  };

  blockly.Blocks.harvester_ifHasCropElse = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(HAS_OPTIONS),
        'LOC'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.harvester_ifHasCropElse = function() {
    var argument = `Maze.has${this.getTitleValue('LOC')}('block_id_${
      this.id
    }')`;
    var doCode = generator.statementToCode(this, 'DO');
    var elseCode = generator.statementToCode(this, 'ELSE');
    var code = `if (${argument}) {\n${doCode}} else {\n${elseCode}}\n`;
    return code;
  };

  blockly.Blocks.harvester_whileHasCrop = {
    helpUrl: '',
    init: function() {
      this.setHSV(322, 0.9, 0.95);
      this.appendDummyInput().appendTitle(msg.whileMsg());
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(HAS_OPTIONS),
        'LOC'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.harvester_whileHasCrop = function() {
    var argument = `Maze.has${this.getTitleValue('LOC')}('block_id_${
      this.id
    }')`;
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    var code = `while (${argument}) {\n${branch}}\n`;
    return code;
  };

  blockly.Blocks.harvester_untilHasCrop = {
    helpUrl: '',
    init: function() {
      this.setHSV(322, 0.9, 0.95);
      this.appendDummyInput().appendTitle(msg.repeatUntil());
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(HAS_OPTIONS),
        'LOC'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  generator.harvester_untilHasCrop = function() {
    var argument = `Maze.has${this.getTitleValue('LOC')}('block_id_${
      this.id
    }')`;
    var branch = generator.statementToCode(this, 'DO');
    branch = Blockly.getInfiniteLoopTrap() + branch;
    var code = `while (!${argument}) {\n${branch}}\n`;
    return code;
  };
};
