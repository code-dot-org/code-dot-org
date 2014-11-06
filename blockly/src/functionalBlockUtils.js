var utils = require('./utils');
var _ = utils.getLodash();

var colors = {
  'Number': [192, 1.00, 0.99], // 00ccff
  'string': [180, 1.00, 0.60], // 0099999
  'image': [285, 1.00, 0.80], // 9900cc
  'boolean': [90, 1.00, 0.4], // 336600
  'none': [0, 0, 0.6]
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
    if (arg.type === 'none') {
      input.setHSV(0, 0, 0.99);
    } else {
      input.setHSV.apply(input, colors[arg.type]);
      input.setCheck(arg.type);
    }
    input.setAlign(Blockly.ALIGN_CENTRE);
  }

  if (type === 'none') {
    block.setFunctionalOutput(false);
  } else {
    block.setFunctionalOutput(true, type);
  }
};

/**
 * Installs a block which generates code that makes an API call, which
 * looks roughly like:
 *
 *     apiName(block_id, arg1 [,arg2 ...])
 *
 * where args with "constantValue" defined are pre-specified arguments,
 * and other args are read from functional inputs. For example:
 *
 *     options = {
 *       blockName: 'functional_setSpriteZeroSpeed',
 *       blockTitle: 'set sprite zero speed',
 *       apiName: 'Studio.setSpriteSpeed',
 *       args: [{constantValue: '0'}, // spriteIndex
 *              {name: 'SPEED', type: 'Number', default:'7'}]
 *     }
 *
 * creates a block which, with an id of '43' and an input of '12', would
 * generate the following code:
 *
 *     'Studio.setSpriteSpeed(block_id_43, 0, 12)'
 */
module.exports.installFunctionalApiCallBlock = function(blockly, generator,
    options) {
  var blockName = options.blockName;
  var blockTitle = options.blockTitle;
  var apiName = options.apiName;
  var args = options.args;

  var blockArgs = args.filter(function(arg) {
    return arg.constantValue === undefined;
  });
  var blockType = 'none';
  blockly.Blocks[blockName] = {
    init: function () {
      module.exports.initTitledFunctionalBlock(this, blockTitle, blockType,
          blockArgs);
    }
  };

  // The generator function depends on "this" being the block object.
  generator[blockName] = function() {
    var apiArgs = [];
    apiArgs.push('\'block_id_' + this.id + '\'');
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      var value = arg.constantValue !== undefined ?
            arg.constantValue :
            Blockly.JavaScript.statementToCode(this, arg.name, false) ||
                arg.default;
      apiArgs.push(value);
    }
    return apiName + '(' + apiArgs.join(',') + ');\n';
  };
};
