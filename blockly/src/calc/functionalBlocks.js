/**
 * A set of functional blocks
 */

exports.install = function(blockly, generator, gensym) {
  installPlus(blockly, generator, gensym);
  installMinus(blockly, generator, gensym);
  installTimes(blockly, generator, gensym);
  installDividedBy(blockly, generator, gensym);
  installMathNumber(blockly, generator, gensym);
  installDraw(blockly, generator, gensym);
};


function initFunctionalBlock(block, title, numArgs) {
  block.setHSV(184, 1.00, 0.74);
  block.appendDummyInput()
      .appendTitle(title)
      .setAlign(Blockly.ALIGN_CENTRE);
  for (var i = 1; i <= numArgs; i++) {
    block.appendFunctionalInput('ARG' + i)
         .setInline(i > 1);
  }
  if (numArgs === 1) {
    // todo (brent) : can we do this without a dummy input, or at least get
    // the single input centered?
    block.appendDummyInput()
        .setInline(true);
  }

  block.setFunctionalOutput(true);
}

function installPlus(blockly, generator, gensym) {
  blockly.Blocks.functional_plus = {
    // Block for turning left or right.
    helpUrl: '',
    init: function() {
      initFunctionalBlock(this, '+', 2);
    }
  };

  generator.functional_plus = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    // return "(" + arg1 + " + " + arg2 + ")";
    return "Calc.expression('+', " + arg1 + ", " + arg2 + ")";
  };
}

function installMinus(blockly, generator, gensym) {
  blockly.Blocks.functional_minus = {
    // Block for turning left or right.
    helpUrl: '',
    init: function() {
      initFunctionalBlock(this, '-', 2);
    }
  };

  generator.functional_minus = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    // return "(" + arg1 + " - " + arg2 + ")";
    return "Calc.expression('-', " + arg1 + ", " + arg2 + ")";
  };
}

function installTimes(blockly, generator, gensym) {
  blockly.Blocks.functional_times = {
    // Block for turning left or right.
    helpUrl: '',
    init: function() {
      initFunctionalBlock(this, '*', 2);
    }
  };

  generator.functional_times = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    // return "(" + arg1 + " * " + arg2 + ")";
    return "Calc.expression('*', " + arg1 + ", " + arg2 + ")";
  };
}

function installDividedBy(blockly, generator, gensym) {
  blockly.Blocks.functional_dividedby = {
    // Block for turning left or right.
    helpUrl: '',
    init: function() {
      initFunctionalBlock(this, '/', 2);
    }
  };

  generator.functional_dividedby = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    // return "(" + arg1 + " / " + arg2 + ")";
    return "Calc.expression('/', " + arg1 + ", " + arg2 + ")";
  };
}

function installDraw(blockly, generator, gensym) {
  blockly.Blocks.functional_draw = {
    // Block for turning left or right.
    helpUrl: '',
    init: function() {
      initFunctionalBlock(this, ' ', 1);
      this.setFunctionalOutput(false);
    }
  };

  generator.functional_draw = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    return "Calc.draw(" + arg1 +", 'block_id_" + this.id + "');\n";
  };
}

function installMathNumber(blockly, generator, gensym) {
  blockly.Blocks.functional_math_number = {
    // Numeric value.
    init: function() {
      this.setHSV(258, 0.35, 0.62);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldTextInput('0',
          Blockly.FieldTextInput.numberValidator), 'NUM');
      this.setFunctionalOutput(true, 'Number');
    }
  };

  generator.functional_math_number = function() {
    return this.getTitleValue('NUM');
  };
}
