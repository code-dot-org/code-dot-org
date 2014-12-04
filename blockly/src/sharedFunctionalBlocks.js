/**
 * A set of functional blocks
 */

var msg = window.blockly.locale;
var functionalBlockUtils = require('./functionalBlockUtils');
var initTitledFunctionalBlock = functionalBlockUtils.initTitledFunctionalBlock;

exports.install = function(blockly, generator, gensym) {
  installPlus(blockly, generator, gensym);
  installMinus(blockly, generator, gensym);
  installTimes(blockly, generator, gensym);
  installDividedBy(blockly, generator, gensym);
  installGreaterThan(blockly, generator, gensym);
  installLessThan(blockly, generator, gensym);
  installNumberEquals(blockly, generator, gensym);
  installStringEquals(blockly, generator, gensym);
  installLogicalAnd(blockly, generator, gensym);
  installLogicalOr(blockly, generator, gensym);
  installLogicalNot(blockly, generator, gensym);
  installBoolean(blockly, generator, gensym);
  installMathNumber(blockly, generator, gensym);
  installString(blockly, generator, gensym);
  installCond(blockly, generator, 1);
  installCond(blockly, generator, 2);
  installCond(blockly, generator, 3);
  installCond(blockly, generator, 4);
};

function installPlus(blockly, generator, gensym) {
  blockly.Blocks.functional_plus = {

    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '+', 'Number', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_plus = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return arg1 + " + " + arg2;
  };
}

function installMinus(blockly, generator, gensym) {
  blockly.Blocks.functional_minus = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '-', 'Number', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_minus = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return arg1 + " - " + arg2;
  };
}

function installTimes(blockly, generator, gensym) {
  blockly.Blocks.functional_times = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '*', 'Number', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_times = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return arg1 + " * " + arg2;
  };
}

function installDividedBy(blockly, generator, gensym) {
  blockly.Blocks.functional_dividedby = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '/', 'Number', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_dividedby = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return arg1 + " / " + arg2;
  };
}

// Install comparators

function installGreaterThan(blockly, generator, gensym) {
  blockly.Blocks.functional_greater_than = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '>', 'boolean', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_greater_than = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " > " + arg2 + ')';
  };
}

function installLessThan(blockly, generator, gensym) {
  blockly.Blocks.functional_less_than = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '<', 'boolean', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_less_than = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " < " + arg2 + ')';
  };
}

function installNumberEquals(blockly, generator, gensym) {
  blockly.Blocks.functional_number_equals = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '=', 'boolean', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_number_equals = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " == " + arg2 + ')';
  };
}

function installStringEquals(blockly, generator, gensym) {
  blockly.Blocks.functional_string_equals = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, msg.stringEquals(), 'boolean', [
        { name: 'ARG1', type: 'string' },
        { name: 'ARG2', type: 'string' }
      ]);
    }
  };

  generator.functional_string_equals = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || '';
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || '';
    return '(' + arg1 + " == " + arg2 + ')';
  };
}

// Install boolean operators

function installLogicalAnd(blockly, generator, gensym) {
  blockly.Blocks.functional_logical_and = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, 'and', 'boolean', [
        { name: 'ARG1', type: 'boolean' },
        { name: 'ARG2', type: 'boolean' }
      ]);
    }
  };

  generator.functional_logical_and = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " && " + arg2 + ')';
  };
}

function installLogicalOr(blockly, generator, gensym) {
  blockly.Blocks.functional_logical_or = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, 'or', 'boolean', [
        { name: 'ARG1', type: 'boolean' },
        { name: 'ARG2', type: 'boolean' }
      ]);
    }
  };

  generator.functional_logical_or = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " || " + arg2 + ')';
  };
}

function installLogicalNot(blockly, generator, gensym) {
  blockly.Blocks.functional_logical_not = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, 'not', 'boolean', [
        { name: 'ARG1', type: 'boolean' }
      ]);
    }
  };

  generator.functional_logical_not = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    return '!(' + arg1 + ')';
  };
}

function installBoolean(blockly, generator, gensym) {
  blockly.Blocks.functional_boolean = {
    // Boolean value.
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, functionalBlockUtils.colors.boolean);
      var values = blockly.Blocks.functional_boolean.VALUES;
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(values), 'VAL')
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'boolean');
    }
  };

  blockly.Blocks.functional_boolean.VALUES = [
        [msg.booleanTrue(), 'true'],
        [msg.booleanFalse(), 'false']];

  generator.functional_boolean = function() {
    return this.getTitleValue('VAL');
  };
}

function installMathNumber(blockly, generator, gensym) {
  blockly.Blocks.functional_math_number = {
    // Numeric value.
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, functionalBlockUtils.colors.Number);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldTextInput('0',
            Blockly.FieldTextInput.numberValidator), 'NUM')
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'Number');
    }
  };

  generator.functional_math_number = function() {
    return this.getTitleValue('NUM');
  };

  blockly.Blocks.functional_math_number_dropdown = {
    // Numeric value.
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, functionalBlockUtils.colors.Number);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldDropdown(), 'NUM')
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'Number');
    }
  };

  generator.functional_math_number_dropdown = generator.functional_math_number;
}

function installString(blockly, generator) {
  blockly.Blocks.functional_string = {
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, functionalBlockUtils.colors.string);
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
}

/**
 * Implements the cond block. numPairs represents the number of
 * condition-value pairs before the default value.
 */
function installCond(blockly, generator, numPairs) {
  var blockName = 'functional_cond_' + numPairs;
  blockly.Blocks[blockName] = {
    helpUrl: '',
    init: function() {
      var args = [];
      for (var i = 0; i < numPairs; i++) {
        args.push({name: 'COND' + i, type: 'boolean', default: 'false'});
        args.push({name: 'VALUE' + i, type: 'none', default: ''});
      }
      args.push({name: 'DEFAULT', type: 'none', default: ''});
      var blockTitle = 'cond';
      var wrapWidth = 2;
      initTitledFunctionalBlock(this, blockTitle, undefined, args, wrapWidth);
    }
  };

  /**
   * // generates code like:
   * function() {
   *   if (cond1) { return value1; }
   *   else if (cond2) {return value2; }
   *   ...
   *   else { return default; }
   * }()
   */
  generator[blockName] = function() {
    var cond, value, defaultValue;
    var code = 'function() {\n  ';
    for (var i = 0; i < numPairs; i++) {
      if (i > 0) {
        code += 'else ';
      }
      cond = Blockly.JavaScript.statementToCode(this, 'COND' + i, false) ||
          false;
      value = Blockly.JavaScript.statementToCode(this, 'VALUE' + i, false) ||
          '';
      code += 'if (' + cond + ') { return ' + value + '; }\n  ';
    }
    defaultValue = Blockly.JavaScript.statementToCode(this, 'DEFAULT', false) ||
        '';
    code += 'else { return ' + defaultValue + '; }\n';
    code += '}()';
    return code;
  };
}
