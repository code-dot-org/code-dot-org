/**
 * Blocks specific to Bee
 */

var msg = require('./locale');
var blockUtils = require('../block_utils');

var OPERATORS = [['=', '=='], ['<', '<'], ['>', '>']];
const RTL_OPERATORS = [['=', '=='], ['>', '<'], ['<', '>']];

var TOOLTIPS = {
  '==': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
  '<': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
  '>': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT
};

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  var generator = blockly.getGenerator();
  blockly.JavaScript = generator;

  addIfOnlyFlower(blockly, generator);
  addIfFlowerHive(blockly, generator);
  addIfElseFlowerHive(blockly, generator);

  addRepeatedActionBlock(
    blockly,
    generator,
    'bee_n_forward',
    msg.moveNForward(),
    msg.moveNForwardTooltip(),
    'moveForward'
  );
  addRepeatedActionBlock(
    blockly,
    generator,
    'bee_n_nectar',
    msg.getNNectar(),
    msg.nectarTooltip(),
    'getNectar'
  );
  addRepeatedActionBlock(
    blockly,
    generator,
    'bee_n_honey',
    msg.makeNHoney(),
    msg.honeyTooltip(),
    'makeHoney'
  );

  addConditionalComparisonBlock(
    blockly,
    generator,
    'bee_ifNectarAmount',
    'if',
    [
      [msg.nectarRemaining(), 'nectarRemaining'],
      [msg.honeyAvailable(), 'honeyAvailable']
    ]
  );

  addConditionalComparisonBlock(
    blockly,
    generator,
    'bee_ifelseNectarAmount',
    'ifelse',
    [
      [msg.nectarRemaining(), 'nectarRemaining'],
      [msg.honeyAvailable(), 'honeyAvailable']
    ]
  );

  addConditionalComparisonBlock(blockly, generator, 'bee_ifTotalNectar', 'if', [
    [msg.totalNectar(), 'nectarCollected'],
    [msg.totalHoney(), 'honeyCreated']
  ]);

  addConditionalComparisonBlock(
    blockly,
    generator,
    'bee_ifelseTotalNectar',
    'ifelse',
    [[msg.totalNectar(), 'nectarCollected'], [msg.totalHoney(), 'honeyCreated']]
  );

  addConditionalComparisonBlock(
    blockly,
    generator,
    'bee_whileNectarAmount',
    'while',
    [
      [msg.nectarRemaining(), 'nectarRemaining'],
      [msg.honeyAvailable(), 'honeyAvailable']
    ]
  );

  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_nectar',
    helpUrl: '',
    title: isK1 ? msg.get() : msg.nectar(),
    titleImage: isK1 ? skin.redFlower : undefined,
    tooltip: msg.nectarTooltip(),
    functionName: 'Maze.getNectar'
  });

  blockUtils.generateSimpleBlock(blockly, generator, {
    name: 'maze_honey',
    helpUrl: '',
    title: isK1 ? msg.make() : msg.honey(),
    titleImage: isK1 ? skin.honey : undefined,
    tooltip: msg.honeyTooltip(),
    functionName: 'Maze.makeHoney'
  });
};

/**
 * Are we at a flower
 */
function addIfOnlyFlower(blockly, generator) {
  blockly.Blocks.bee_ifOnlyFlower = {
    helpUrl: '',
    init: function() {
      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(msg.atFlower());
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setTooltip(msg.ifOnlyFlowerTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  // EXAMPLE:
  // if (Maze.atFlower()) { code }
  generator.bee_ifOnlyFlower = function() {
    // Generate JavaScript for 'if' conditional if we're at a flower
    var argument = 'Maze.atFlower' + "('block_id_" + this.id + "')";
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };
}

/**
 * Are we at a flower or a hive
 */
function addIfFlowerHive(blockly, generator) {
  blockly.Blocks.bee_ifFlower = {
    helpUrl: '',
    init: function() {
      var LOCATIONS = [
        [msg.atFlower(), 'atFlower'],
        [msg.atHoneycomb(), 'atHoneycomb']
      ];

      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(LOCATIONS),
        'LOC'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.setTooltip(msg.ifFlowerTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  // EXAMPLES:
  // if (Maze.atFlower()) { code }
  // if (Maze.atHoneycomb()) { code }
  generator.bee_ifFlower = function() {
    // Generate JavaScript for 'if' conditional if we're at a flower/hive
    var argument =
      'Maze.' + this.getTitleValue('LOC') + "('block_id_" + this.id + "')";
    var branch = generator.statementToCode(this, 'DO');
    var code = 'if (' + argument + ') {\n' + branch + '}\n';
    return code;
  };
}

/**
 * Are we at a flower or a hive with else
 */
function addIfElseFlowerHive(blockly, generator) {
  blockly.Blocks.bee_ifElseFlower = {
    helpUrl: '',
    init: function() {
      var LOCATIONS = [
        [msg.atFlower(), 'atFlower'],
        [msg.atHoneycomb(), 'atHoneycomb']
      ];

      this.setHSV(196, 1.0, 0.79);
      this.appendDummyInput().appendTitle(msg.ifCode());
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(LOCATIONS),
        'LOC'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      this.setTooltip(msg.ifelseFlowerTooltip());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    }
  };

  // EXAMPLES:
  // if (Maze.atFlower()) { code } else { morecode }
  // if (Maze.atHoneycomb()) { code } else { morecode }
  generator.bee_ifElseFlower = function() {
    // Generate JavaScript for 'if' conditional if we're at a flower/hive
    var argument =
      'Maze.' + this.getTitleValue('LOC') + "('block_id_" + this.id + "')";
    var branch0 = generator.statementToCode(this, 'DO');
    var branch1 = generator.statementToCode(this, 'ELSE');
    var code =
      'if (' + argument + ') {\n' + branch0 + '} else {\n' + branch1 + '}\n';
    return code;
  };
}

function addRepeatedActionBlock(
  blockly,
  generator,
  name,
  blockMsg,
  tooltip,
  func
) {
  blockly.Blocks[name] = {
    helpUrl: '',
    init: function() {
      this.setHSV(184, 1.0, 0.74);
      this.interpolateMsg(
        blockMsg,
        ['NUM', 'Number', Blockly.ALIGN_RIGHT],
        Blockly.ALIGN_RIGHT
      );

      this.setInputsInline(true);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(tooltip);
    }
  };

  generator[name] = function() {
    let num =
      generator.valueToCode(this, 'NUM', Blockly.JavaScript.ORDER_NONE) || 0;
    let loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'count',
      Blockly.Variables.NAME_TYPE
    );
    return `for (var ${loopVar} = 0; ${loopVar} < ${num}; ${loopVar}++) {\n  Maze.${func}('block_id_${
      this.id
    }');\n}\n`;
  };
}

function addConditionalComparisonBlock(blockly, generator, name, type, arg1) {
  blockly.Blocks[name] = {
    helpUrl: '',
    init: function() {
      var self = this;

      var conditionalMsg;
      switch (type) {
        case 'if':
          conditionalMsg = msg.ifCode();
          this.setHSV(196, 1.0, 0.79);
          break;
        case 'ifelse':
          conditionalMsg = msg.ifCode();
          this.setHSV(196, 1.0, 0.79);
          break;
        case 'while':
          conditionalMsg = msg.whileMsg();
          this.setHSV(322, 0.9, 0.95);
          break;
        default:
          throw 'Unexpected type for addConditionalComparisonBlock';
      }

      this.appendDummyInput().appendTitle(conditionalMsg);
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(arg1),
        'ARG1'
      );
      this.appendDummyInput().appendTitle(' ');
      this.appendDummyInput().appendTitle(
        new blockly.FieldDropdown(Blockly.RTL ? RTL_OPERATORS : OPERATORS),
        'OP'
      );
      this.appendDummyInput().appendTitle(' ');
      this.appendDummyInput().appendTitle(
        new blockly.FieldTextInput('0', blockly.FieldTextInput.numberValidator),
        'ARG2'
      );
      this.setInputsInline(true);
      this.appendStatementInput('DO').appendTitle(msg.doCode());
      if (type === 'ifelse') {
        this.appendStatementInput('ELSE').appendTitle(msg.elseCode());
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);

      this.setTooltip(function() {
        var op = self.getTitleValue('OP');
        return TOOLTIPS[op];
      });
    }
  };

  // if (Maze.nectarCollected() > 0) { code }
  // if (Maze.honeyCreated() === 1) { code }
  generator[name] = function() {
    // Generate JavaScript for 'if' conditional if we're at a flower/hive
    var argument1 =
      'Maze.' + this.getTitleValue('ARG1') + "('block_id_" + this.id + "')";
    var operator = this.getTitleValue('OP');
    var argument2 = this.getTitleValue('ARG2');
    var branch0 = generator.statementToCode(this, 'DO');
    var elseBlock = '';
    if (type === 'ifelse') {
      var branch1 = generator.statementToCode(this, 'ELSE');
      elseBlock = ' else {\n' + branch1 + '}';
    }

    var command = type;
    if (type === 'ifelse') {
      command = 'if';
    }

    return (
      command +
      ' (' +
      argument1 +
      ' ' +
      operator +
      ' ' +
      argument2 +
      ') {\n' +
      branch0 +
      '}' +
      elseBlock +
      '\n'
    );
  };
}
