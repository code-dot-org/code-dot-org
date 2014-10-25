/**
 * A set of functional blocks
 */

exports.install = function(blockly, generator, gensym) {
  installPlus(blockly, generator, gensym);
  installMinus(blockly, generator, gensym);
  installTimes(blockly, generator, gensym);
  installDividedBy(blockly, generator, gensym);
  installMathNumber(blockly, generator, gensym);
};


function initFunctionalBlock(block, title, numArgs) {
  block.setHSV(184, 1.00, 0.74);
  block.setFunctional(true, {
    headerHeight: 30,
  });

  var options = {
    fixedSize: { height: 35 },
    fontSize: 25 // in pixels
  };

  block.appendDummyInput()
      .appendTitle(new Blockly.FieldLabel(title, options))
      .setAlign(Blockly.ALIGN_CENTRE);
  for (var i = 1; i <= numArgs; i++) {
    block.appendFunctionalInput('ARG' + i)
         .setInline(i > 1)
         .setColour({ hue: 184, saturation: 1.00, value: 0.74 })
         .setCheck('Number');
  }

  block.setFunctionalOutput(true, 'Number');
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
    return arg1 + " + " + arg2;
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
    return arg1 + " - " + arg2;
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
    return arg1 + " * " + arg2;
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
    return arg1 + " / " + arg2;
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
      this.setHSV(184, 1.00, 0.74);
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
}
