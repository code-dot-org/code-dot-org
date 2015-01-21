/**
 * A set of functional blocks
 */
var utils = require('./utils');
var _ = utils.getLodash();
var msg = require('../locale/current/common');
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
  installCond(blockly, generator);
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
function installCond(blockly, generator) {
  // TODO(brent) - rtl

  var blockName = 'functional_cond';
  blockly.Blocks[blockName] = {
    helpUrl: '',
    init: function() {
      this.pairs_ = [];
      this.setFunctional(true, {
        headerHeight: 30
      });

      var options = {
        fixedSize: { height: 35 }
      };

      var plusField = new Blockly.FieldIcon('+');
      plusField.getRootElement().addEventListener('mousedown',
        _.bind(this.addConditionalRow, this));

      this.appendDummyInput()
        .appendTitle(new Blockly.FieldLabel('cond', options))
        .setAlign(Blockly.ALIGN_CENTRE);

      this.appendFunctionalInput('DEFAULT');

      this.appendDummyInput('PLUS')
        .appendTitle(plusField)
        .setInline(true);

      this.setFunctionalOutput(true);

      this.addConditionalRow();
    },

    /**
     * Add another condition/value pair to the end.
     */
    addConditionalRow: function () {
      // id is either the last value plus 1, or if we have no values yet 0
      var id = this.pairs_.length > 0 ? (this.pairs_.slice(-1) * 1 + 1) : 0;
      this.pairs_.push(id);

      var cond = this.appendFunctionalInput('COND' + id);
      cond.setHSV.apply(cond, functionalBlockUtils.colors.boolean);
      cond.setCheck('boolean');
      this.moveInputBefore('COND' + id, 'DEFAULT');

      this.appendFunctionalInput('VALUE' + id)
        .setInline(true)
        .setHSV(0, 0, 0.99);
      this.moveInputBefore('VALUE' + id, 'DEFAULT');

      var minusInput = this.appendDummyInput('MINUS' + id)
        .setInline(true);

      if (this.pairs_.length > 1) {
        var minusField = new Blockly.FieldIcon('-');
        minusField.getRootElement().addEventListener('mousedown',
          _.bind(this.removeConditionalRow, this, id));
        minusInput.appendTitle(minusField);
      }

      this.moveInputBefore('MINUS' + id, 'DEFAULT');
    },

    /**
     * Remove the condition/value pair with the given id. No-op if no row with
     * that id.
     */
    removeConditionalRow: function (id) {
      var index = this.pairs_.indexOf(id);
      if (!_(this.pairs_).contains(id) || this.pairs_.length === 1) {
        return;
      }
      this.pairs_.splice(index, 1);

      var cond = this.getInput('COND' + id);
      var child = cond.connection.targetBlock();
      if (child) {
        child.dispose();
      }
      this.removeInput('COND' + id);

      var val = this.getInput('VALUE' + id);
      child = val.connection.targetBlock();
      if (child) {
        child.dispose();
      }
      this.removeInput('VALUE' + id);

      this.removeInput('MINUS' + id);
    },

    /**
     * Serialize pairs so that we can deserialize with the same ids
     */
    mutationToDom: function() {
      if (this.pairs_.length <= 1) {
        return null;
      }
      var container = document.createElement('mutation');
      container.setAttribute('pairs', this.pairs_.join(','));
      return container;
    },

    /**
     * Deserialize and cause our block to have same ids
     */
    domToMutation: function (element) {
      var i;
      var pairs = element.getAttribute('pairs');
      if (!pairs) {
        return;
      }

      pairs = pairs.split(',').map(function (item) {
        return parseInt(item, 10);
      });

      // Our pairs, which are used to name rows, are not necessarily contiguous.
      // We ensure that we end up with the same set of pairs by adding lots
      // of rows, and then deleting the unneeded ones (simulating what happened
      // to originally create this block)
      var lastRow = pairs.slice(-1);
      for (i = 1; i <= lastRow; i++) {
        this.addConditionalRow();
      }

      for (i = 0; i < lastRow; i++) {
        if (!_(pairs).contains(i)) {
          this.removeConditionalRow(i);
        }
      }
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
    var code = '(function () {\n  ';
    for (var i = 0; i < this.pairs_.length; i++) {
      if (i > 0) {
        code += 'else ';
      }
      var id = this.pairs_[i];
      cond = Blockly.JavaScript.statementToCode(this, 'COND' + id, false) ||
          false;
      value = Blockly.JavaScript.statementToCode(this, 'VALUE' + id, false) ||
          '';
      code += 'if (' + cond + ') { return ' + value + '; }\n  ';
    }
    defaultValue = Blockly.JavaScript.statementToCode(this, 'DEFAULT', false) ||
        '';
    code += 'else { return ' + defaultValue + '; }\n';
    code += '})()';
    return code;
  };
}
