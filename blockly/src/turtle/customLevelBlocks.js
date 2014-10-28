/**
 * A set of blocks used by some of our custom levels (i.e. built by level builder)
 */

var msg = require('../../locale/current/turtle');

exports.install = function(blockly, generator, gensym) {
 installDrawASquare(blockly, generator, gensym);
 installCreateACircle(blockly, generator, gensym);
 installCreateASnowflower(blockly, generator, gensym);
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

function createACircleCode (size, gensym) {
  var loopVar = gensym('count');
  return [
    '// create_a_circle',
    'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 36; ' +
          loopVar + '++) {',
    '  Turtle.moveForward(' + size + ');',
    '  Turtle.turnRight(10);',
    '}\n'].join('\n');
}


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
        'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 5; ' +
              loopVar + '++) {',
        '  Turtle.moveForward(' + value_length + ');',
        '  Turtle.turnRight(90);',
        '}\n'].join('\n');
  };
}

/**
 * create_a_circle and create_a_circle_size
 * first defaults to size 10, second provides a size param
 */
function installCreateACircle(blockly, generator, gensym) {
  blockly.Blocks.create_a_circle = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.createACircle());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  blockly.Blocks.create_a_circle_size = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.createACircle());
      this.appendValueInput('VALUE')
          .setAlign(blockly.ALIGN_RIGHT)
          .setCheck('Number')
              .appendTitle(msg.sizeParameter() + ':');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.create_a_circle = function() {
    return createACircleCode(10, gensym);
  };

  generator.create_a_circle_size = function() {
    var size = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    return createACircleCode(size, gensym);
  };
}

/**
 * create_a_
 */
function installCreateASnowflower(blockly, generator, gensym) {
  blockly.Blocks.create_a_snowflower = {
    // Draw a square.
    init: function() {
      this.setHSV(94, 0.84, 0.60);
      this.appendDummyInput()
          .appendTitle(msg.createASnowflower());
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.create_a_snowflower = function() {
    var loopVar = gensym('count');
    return [
      '// draw_a_snowflower',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 5; ' + loopVar + '++) {',
      createACircleCode(2, gensym),
      createACircleCode(4, gensym),
      '  Turtle.turnRight(72);',
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
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnRight(60);',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnRight(120);',
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
        '  Turtle.moveForward(' + value_length + ');',
        '  Turtle.turnLeft(120);',
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
        '  Turtle.moveForward(' + value_length + ');',
        '  Turtle.turnLeft(60);',
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
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnLeft(90);',
      '}',
      'Turtle.turnLeft(90);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnRight(90);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnLeft(120);',
      '}',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnLeft(90);\n'].join('\n');
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
      'Turtle.penColour("#228b22");',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnLeft(18);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {',
      '  Turtle.penColour(' + color_random + ');',
      '  Turtle.turnLeft(36);',
      '  Turtle.moveForward(' + value_length + ' / 2);',
      '  Turtle.moveBackward(' + value_length + '/ 2);',
      '}',
      'Turtle.turnRight(198);',
      'Turtle.jumpForward(' + value_length + ');',
      'Turtle.turnRight(180);\n'].join('\n');
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
      '  Turtle.penColour("#7fffd4");',
      '  Turtle.moveForward(30);',
      '  Turtle.turnRight(90);',
      '  Turtle.moveForward(15);',
      '  Turtle.turnRight(90);',
      '  Turtle.penColour("#0000cd");',
      '  Turtle.moveForward(15);',
      '  Turtle.turnRight(90);',
      '  Turtle.moveForward(30);',
      '  Turtle.turnRight(45);',
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
      'Turtle.turnRight(18);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 5; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnRight(144);',
      '}',
      'Turtle.turnLeft(18);\n'].join('\n');
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
      'Turtle.turnLeft(90);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' + loopVar + '++) {',
      '  Turtle.moveForward(20);',
      '  Turtle.turnRight(90);',
      '}',
      'Turtle.turnRight(90);',
      'Turtle.moveBackward(10);',
      'Turtle.moveForward(40);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(80);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(40);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(80);',
      'Turtle.moveBackward(15);',
      'Turtle.turnLeft(120);',
      'Turtle.moveForward(40);',
      'Turtle.moveBackward(40);',
      'Turtle.turnRight(30);',
      'Turtle.moveBackward(40);',
      'Turtle.turnRight(210);',
      'Turtle.moveForward(40);',
      'Turtle.moveBackward(40);',
      'Turtle.turnRight(60);',
      'Turtle.moveForward(115);',
      'Turtle.moveBackward(50);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(40);',
      'Turtle.turnLeft(90);',
      'Turtle.moveForward(50);\n'].join('\n');
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
      'Turtle.penColour("#ff0000");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {',
      '  Turtle.moveForward(20);',
      '  Turtle.turnLeft(120);',
      '}',
      'Turtle.penColour("#000000");',
      'Turtle.turnLeft(90);',
      'Turtle.jumpForward(20);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(20);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(20);',
      'Turtle.turnRight(90);',
      'Turtle.moveForward(' + value_length + ');',
      'Turtle.turnRight(90);',
      'for (var ' + loopVar2 + ' = 0; ' + loopVar2 + ' < 3; ' + loopVar2 + '++) {',
      '  Turtle.moveForward(20);',
      '  Turtle.turnLeft(120);',
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
      'Turtle.penColour("#808080");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 360; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.moveBackward(' + value_length + ');',
      '  Turtle.turnRight(1);',
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
      'Turtle.penColour("#0000cd");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnRight(18);',
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
      'Turtle.penColour("#0000cd");',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 10; ' + loopVar + '++) {',
      '  Turtle.moveForward(' + value_length + ');',
      '  Turtle.turnLeft(18);',
      '}\n'].join('\n');
  };
}
