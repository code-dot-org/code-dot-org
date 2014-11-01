var utils = require('./utils');
var _ = utils.getLodash();

var colors = {
  Number: [192, 1.00, 0.99], // 00ccff
  string: [180, 1.00, 0.60], // 0099999
  image: [285, 1.00, 0.80], // 9900cc
  boolean: [90, 1.00, 0.4], // 336600
  none: [0, 0, 0.6]
};
module.exports.colors = colors;

/**
 * Helper function to create the init section for a functional block
 */
module.exports.initTitledFunctionalBlock = function (block, title, type, args) {
  block.setFunctional(true, {
    headerHeight: 30
  });
  block.setHSV.apply(block, colors[type]);

  var options = {
    fixedSize: { height: 35 }
  };

  block.appendDummyInput()
    .appendTitle(new Blockly.FieldLabel(title, options))
    .setAlign(Blockly.ALIGN_CENTRE);

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    var input = block.appendFunctionalInput(arg.name);
    input.setInline(i > 0);
    input.setHSV.apply(input, colors[arg.type]);
    input.setCheck(arg.type);
    input.setAlign(Blockly.ALIGN_CENTRE);
  }

  if (type === 'none') {
    block.setFunctionalOutput(false);
  } else {
    block.setFunctionalOutput(true, type);
  }
};

module.exports.installString = function(blockly, generator) {
  blockly.Blocks.functional_string = {
    // Numeric value.
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, colors.string);
      this.appendDummyInput()
        .appendTitle(new Blockly.FieldLabel('"'))
        .appendTitle(new Blockly.FieldTextInput(''), 'VAL')
        .appendTitle(new Blockly.FieldLabel('"'))
        .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'string');
    }
  };

  generator.functional_string = function() {
    return blockly.JavaScript.quote_(this.getTitleValue('VAL'));
  };
};

/**
 * Installs a block which generates code that makes an API call, which
 * looks roughly like:
 *
 *     apiName(block_id [,extraArgs], arg1 [,arg2 ...])
 *
 * where extraArgs are pre-specified arguments, and args are read from
 * functional inputs. For example: 
 *
 *     options = {
 *       blockName: 'functional_setSpriteZeroSpeed', 
 *       blockTitle: 'set sprite zero speed',
 *       apiName: 'Studio.setSpriteSpeed',
 *       extraArgs: ['0'], // spriteIndex
 *       args: [{name: 'SPEED', type: 'Number', default:'7'}]
 *     }
 *
 * creates a block which might generate the following code:
 *
 *     Studio.setSpriteSpeed(block_id_43, 0, 7)
 */
module.exports.installFunctionalApiCallBlock = function(blockly, generator,
    options) {
  var blockName = options.blockName;
  var blockTitle = options.blockTitle;
  var apiName = options.apiName;
  var extraArgs = options.extraArgs;
  var args = options.args;             

  blockly.Blocks[blockName] = {
    init: function () {
      module.exports.initTitledFunctionalBlock(this, blockTitle, 'none', args);
    }
  };

  generator[blockName] = _.partial(function(apiName, extraArgs, args) {
    var apiArgs = [];
    apiArgs.push('\'block_id_' + this.id + '\'');
    if (extraArgs && extraArgs.length) {
      apiArgs = apiArgs.concat(extraArgs);
    }
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      var value = Blockly.JavaScript.statementToCode(this, arg.name, false) ||
          arg.default;
      apiArgs.push(value);
    }
    return apiName + '(' + apiArgs.join(',') + ');\n';
  }, apiName, extraArgs, args);
};
