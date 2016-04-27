/**
 * A set of blocks used by some of our custom levels (i.e. built by level builder)
 */

var msg = require('./locale');


exports.install = function (blockly, generator, gensym) {
 installDrawASquare(blockly, generator, gensym);
 installCreateACircle(blockly, generator, gensym);
 installCreateASnowflakeBranch(blockly, generator, gensym);
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

 installCreateASnowflakeDropdown(blockly, generator, gensym);
};

var LENGTH_PARAM = msg.lengthParameter();

function createACircleCode(size, gensym, indent) {
  var loopVar = gensym('count');
  indent = indent || '';
  return [
    indent + '// create_a_circle',
    indent + 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 36; ' +
    indent +       loopVar + '++) {',
    indent + '  Turtle.moveForward(' + size + ');',
    indent + '  Turtle.turnRight(10);',
    indent + '}\n'].join('\n');
}

/**
 * Returns an initialization object that sets up blockly attributes;
 *
 * @param title - The title of the block that will be visible to the user.
 * @param [parameter] - Optional parameter for blocks that accept a value
 *    parameter. This is the title of the parameter.
 * @return the initialization object
 */
function makeBlockInitializer(title, parameter) {
  return {
    init: function () {
      this.setHSV(94, 0.84, 0.60);

      this.appendDummyInput().appendTitle(title);

      if (parameter !== undefined) {
        this.appendValueInput('VALUE')
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(Blockly.BlockValueType.NUMBER)
            .appendTitle(parameter + ':');
      }

      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };
}

/**
 * Same as draw_a_square, except inputs are not inlined
 */
function installDrawASquare(blockly, generator, gensym) {
  // Create a fake "draw a square" function so it can be made available to users
  // without being shown in the workspace.
  var title = msg.drawASquare();

  blockly.Blocks.draw_a_square_custom = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_square_custom = function () {
    // Generate JavaScript for drawing a square.
    var value_length = generator.valueToCode(
        this, 'VALUE', generator.ORDER_ATOMIC);
    var loopVar = gensym('count');
    return [
        '// draw_a_square',
        'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 4; ' +
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

  var title = msg.createACircle();
  var param = msg.sizeParameter();

  blockly.Blocks.create_a_circle = makeBlockInitializer(title);

  blockly.Blocks.create_a_circle_size = makeBlockInitializer(title, param);

  generator.create_a_circle = function () {
    return createACircleCode(10, gensym);
  };

  generator.create_a_circle_size = function () {
    var size = generator.valueToCode(this, 'VALUE', generator.ORDER_ATOMIC);
    return createACircleCode(size, gensym);
  };
}

/**
 * create_a_snowflower
 */
function installCreateASnowflakeBranch(blockly, generator, gensym) {

  var title = msg.createASnowflakeBranch();

  blockly.Blocks.create_a_snowflake_branch = makeBlockInitializer(title);

  generator.create_a_snowflake_branch = function () {
    var loopVar = gensym('count');
    var loopVar2 = gensym('count');
    return [
      '// create_a_snowflake_branch',
      'Turtle.jumpForward(90);',
      'Turtle.turnLeft(45);',
      'for (var ' + loopVar + ' = 0; ' + loopVar + ' < 3; ' + loopVar + '++) {',
      '  for (var ' + loopVar2 + ' = 0; ' + loopVar2 + ' < 3; ' + loopVar2 + '++) {',
      '    Turtle.moveForward(30);',
      '    Turtle.moveBackward(30);',
      '    Turtle.turnRight(45);',
      '  }',
      '  Turtle.turnLeft(90);',
      '  Turtle.moveBackward(30);',
      '  Turtle.turnLeft(45);',
      '}',
      'Turtle.turnRight(45);\n'].join('\n');
  };
}


/**
 * Draw a rhombus function call block
 */
function installDrawARhombus(blockly, generator, gensym) {

  var title = msg.drawARhombus();

  blockly.Blocks.draw_a_rhombus = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_rhombus = function () {
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

  var title = msg.drawATriangle();

  blockly.Blocks.draw_a_triangle = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_triangle = function () {
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

  var title = msg.drawAHexagon();

  blockly.Blocks.draw_a_hexagon = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_hexagon = function () {
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

  var title = msg.drawAHouse();

  blockly.Blocks.draw_a_house = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_house = function () {
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

  var title = msg.drawAFlower();

  blockly.Blocks.draw_a_flower = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_flower = function () {
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

  var title = msg.drawASnowflake();

  blockly.Blocks.draw_a_snowflake = makeBlockInitializer(title);

  generator.draw_a_snowflake = function () {
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

  var title = msg.drawAStar();

  blockly.Blocks.draw_a_star = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_star = function () {
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

  var title = msg.drawARobot();

  blockly.Blocks.draw_a_robot = makeBlockInitializer(title);

  generator.draw_a_robot = function () {
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

  var title = msg.drawARocket();

  blockly.Blocks.draw_a_rocket = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_rocket = function () {
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

  var title = msg.drawAPlanet();

  blockly.Blocks.draw_a_planet = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_a_planet = function () {
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

  var title = msg.drawUpperWave();

  blockly.Blocks.draw_upper_wave = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_upper_wave = function () {
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

  var title = msg.drawLowerWave();

  blockly.Blocks.draw_lower_wave = makeBlockInitializer(title, LENGTH_PARAM);

  generator.draw_lower_wave = function () {
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

function installCreateASnowflakeDropdown(blockly, generator, gensym) {
  var snowflakes = [
    [msg.createSnowflakeSquare(), 'square'],
    [msg.createSnowflakeParallelogram(), 'parallelogram'],
    [msg.createSnowflakeLine(), 'line'],
    [msg.createSnowflakeSpiral(), 'spiral'],
    [msg.createSnowflakeFlower(), 'flower'],
    [msg.createSnowflakeFractal(), 'fractal'],
    [msg.createSnowflakeRandom(), 'random']
  ];


  blockly.Blocks.create_snowflake_dropdown = {
    // We use custom initialization (instead of makeBlockInitializer) here
    // because each initialization needs a new instance of the FieldDropdown.
    init: function () {
      this.setHSV(94, 0.84, 0.60);

      var title = new blockly.FieldDropdown(snowflakes);
      this.appendDummyInput().appendTitle(title, 'TYPE');

      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  generator.create_snowflake_dropdown = function () {
    var type = this.getTitleValue('TYPE');
    return "Turtle.drawSnowflake('" + type + "', 'block_id_" + this.id + "');";
  };
}
