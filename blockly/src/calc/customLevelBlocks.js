/**
 * A set of blocks used by some of our custom levels (i.e. built by level builder)
 */

var msg = require('../../locale/current/calc');

exports.install = function(blockly, generator, gensym) {
 installDrawASquare(blockly, generator, gensym);
 installDrawATriangle(blockly, generator, gensym);
 installDrawAHouse(blockly, generator, gensym);
 installDrawAFlower(blockly, generator, gensym);
 installDrawASnowflake(blockly, generator, gensym);
 installDrawAHexagon(blockly, generator, gensym);
 installDrawAStar(blockly, generator, gensym);
 installDrawARobot(blockly, generator, gensym);
 installDrawARocket(blockly, generator, gensym);
 installDrawAPlanet(blockly, generator, gensym);
 installDrawARhombus(blockly, generator, gensym);
 installDrawUpperWave(blockly, generator, gensym);
 installDrawLowerWave(blockly, generator, gensym);
};

/**
 * Same as draw_a_square, except inputs are not inlined
 */
function installDrawASquare(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_square_custom = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawASquare());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_square_custom = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
        '// draw_a_square',
        'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' +
              loopVar + '++) {',
        '  Calc.moveForward(' + value_length + ');',
        '  Calc.turnRight(90);',
        '}\n'].join('\n');
  };
}

/**
 * Draw a rhombus function call block
 */
function installDrawARhombus(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_rhombus = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawARhombus());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_rhombus = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 2; ' +
            loopVar + '++) {',
      '  Calc.moveForward(' + value_length + ');',
      '  Calc.turnRight(60);',
      '  Calc.moveForward(' + value_length + ');',
      '  Calc.turnRight(120);',
      '}\n'].join('\n');
  };
}

/**
 * Draw a triangle function call block
 */
function installDrawATriangle(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_triangle = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawATriangle());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_triangle = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
        '// draw_a_triangle',
        'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' +
              loopVar + '++) {',
        '  Calc.moveForward(' + value_length + ');',
        '  Calc.turnLeft(120);',
        '}\n'].join('\n');
  };
}

/**
 * Draw a triangle function call block
 */
function installDrawAHexagon(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_hexagon = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAHexagon());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_hexagon = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
        '// draw_a_triangle',
        'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 6; ' +
              loopVar + '++) {',
        '  Calc.moveForward(' + value_length + ');',
        '  Calc.turnLeft(60);',
        '}\n'].join('\n');
  };
}

/**
 * Draw a house function call block
 */
function installDrawAHouse(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_house = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAHouse());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_house = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {',
      '  Calc.moveForward(' + value_length + ');',
      '  Calc.turnLeft(90);',
      '}',
      'Calc.turnLeft(90);',
      'Calc.moveForward(' + value_length + ');',
      'Calc.turnRight(90);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {',
      '  Calc.moveForward(' + value_length + ');',
      '  Calc.turnLeft(120);',
      '}',
      'Calc.turnRight(90);',
      'Calc.moveForward(' + value_length + ');',
      'Calc.turnLeft(90);\n'].join('\n');
  };
}

/**
 * Draw a flower function call block
 */
function installDrawAFlower(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_flower = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAFlower());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_flower = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    var color_random = generator.colour_random()[0];
    return [
      'Calc.penColour("#228b22");',
      'Calc.moveForward(' + value_length + ');',
      'Calc.turnLeft(18);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {',
      '  Calc.penColour(' + color_random + ');',
      '  Calc.turnLeft(36);',
      '  Calc.moveForward(' + value_length + ' / 2);',
      '  Calc.moveBackward(' + value_length + '/ 2);',
      '}',
      'Calc.turnRight(198);',
      'Calc.jumpForward(' + value_length + ');',
      'Calc.turnRight(180);\n'].join('\n');
  };
}

/**
 * Draw a snowflake function call block
 */
function installDrawASnowflake(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_snowflake = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawASnowflake());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_snowflake = function() {
    // Generate JavaScript for drawing a square.
    var loopVar = gensym('count');

    var color_random = generator.colour_random()[0];
    return [
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 8; ' + loopVar + '++) {',
      '  Calc.penColour("#7fffd4");',
      '  Calc.moveForward(30);',
      '  Calc.turnRight(90);',
      '  Calc.moveForward(15);',
      '  Calc.turnRight(90);',
      '  Calc.penColour("#0000cd");',
      '  Calc.moveForward(15);',
      '  Calc.turnRight(90);',
      '  Calc.moveForward(30);',
      '  Calc.turnRight(45);',
      '}\n'].join('\n');
  };
}

/**
 * Draw a star function call block
 */
function installDrawAStar(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_star = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAStar());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_star = function() {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return [
      'Calc.turnRight(18);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 5; ' + loopVar + '++) {',
      '  Calc.moveForward(' + value_length + ');',
      '  Calc.turnRight(144);',
      '}',
      'Calc.turnLeft(18);\n'].join('\n');
  };
}

/**
 * Draw a robot function call block
 */
function installDrawARobot(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_robot = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawARobot());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_robot = function() {
    // Generate JavaScript for drawing a square.
    var loopVar = gensym('count');

    return [
      'Calc.turnLeft(90);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {',
      '  Calc.moveForward(20);',
      '  Calc.turnRight(90);',
      '}',
      'Calc.turnRight(90);',
      'Calc.moveBackward(10);',
      'Calc.moveForward(40);',
      'Calc.turnRight(90);',
      'Calc.moveForward(80);',
      'Calc.turnRight(90);',
      'Calc.moveForward(40);',
      'Calc.turnRight(90);',
      'Calc.moveForward(80);',
      'Calc.moveBackward(15);',
      'Calc.turnLeft(120);',
      'Calc.moveForward(40);',
      'Calc.moveBackward(40);',
      'Calc.turnRight(30);',
      'Calc.moveBackward(40);',
      'Calc.turnRight(210);',
      'Calc.moveForward(40);',
      'Calc.moveBackward(40);',
      'Calc.turnRight(60);',
      'Calc.moveForward(115);',
      'Calc.moveBackward(50);',
      'Calc.turnRight(90);',
      'Calc.moveForward(40);',
      'Calc.turnLeft(90);',
      'Calc.moveForward(50);\n'].join('\n');
  };
}


/**
 * Draw a robot function call block
 */
function installDrawARocket(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_rocket = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawARocket());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_rocket = function() {
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    var loopVar2 = gensym('count');

    return [
      'Calc.penColour("#ff0000");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {',
      '  Calc.moveForward(20);',
      '  Calc.turnLeft(120);',
      '}',
      'Calc.penColour("#000000");',
      'Calc.turnLeft(90);',
      'Calc.jumpForward(20);',
      'Calc.moveForward(' + value_length + ');',
      'Calc.turnRight(90);',
      'Calc.moveForward(20);',
      'Calc.turnRight(90);',
      'Calc.moveForward(' + value_length + ');',
      'Calc.turnRight(90);',
      'Calc.moveForward(20);',
      'Calc.turnRight(90);',
      'Calc.moveForward(' + value_length + ');',
      'Calc.turnRight(90);',
      'for (var ' + loopVar2 + ' = 0; ' + loopVar2 + ' < 3; ' + loopVar2 + '++) {',
      '  Calc.moveForward(20);',
      '  Calc.turnLeft(120);',
      '}\n'].join('\n');
  };
}

/**
 * Draw a planet function call block
 */
function installDrawAPlanet(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_a_planet = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawAPlanet());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_a_planet = function() {
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');


    return [
      'Calc.penColour("#808080");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 360; ' + loopVar + '++) {',
      '  Calc.moveForward(' + value_length + ');',
      '  Calc.moveBackward(' + value_length + ');',
      '  Calc.turnRight(1);',
      '}\n'].join('\n');
  };
}

/**
 * Draw upper wave function call block
 */
function installDrawUpperWave(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_upper_wave = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawUpperWave());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_upper_wave = function() {
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return [
      'Calc.penColour("#0000cd");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {',
      '  Calc.moveForward(' + value_length + ');',
      '  Calc.turnRight(18);',
      '}\n'].join('\n');
  };
}

/**
 * Draw lower wave function call block
 */
function installDrawLowerWave(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  blockly.Blocks.draw_lower_wave = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.drawLowerWave());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.lengthParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.draw_lower_wave = function() {
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');

    return [
      'Calc.penColour("#0000cd");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {',
      '  Calc.moveForward(' + value_length + ');',
      '  Calc.turnLeft(18);',
      '}\n'].join('\n');
  };
}
