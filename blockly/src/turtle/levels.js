var levelBase = require('../level_base');
var Colours = require('./core').Colours;
var answer = require('./answers').answer;
var msg = require('../../locale/current/turtle');
var blockUtils = require('../block_utils');

// An early hack introduced some levelbuilder levels as page 5, level 7. Long
// term we can probably do something much cleaner, but for now I'm calling
// out that this level is special (on page 5).
var LEVELBUILDER_LEVEL = 7;

//TODO: Fix hacky level-number-dependent toolbox.
var toolbox = function(page, level) {
  return require('./toolbox.xml')({
    page: page,
    level: level
  });
};

//TODO: Fix hacky level-number-dependent startBlocks.
var startBlocks = function(page, level) {
  return require('./startBlocks.xml')({
    page: page,
    level: level
  });
};

var req = require('./requiredBlocks');
var makeMathNumber = req.makeMathNumber;
var simpleBlock = req.simpleBlock;
var repeat = req.repeat;
var drawASquare = req.drawASquare;
var drawASnowman = req.drawASnowman;
var MOVE_FORWARD_INLINE = req.MOVE_FORWARD_INLINE;
var MOVE_FORWARD_OR_BACKWARD_INLINE = req.MOVE_FORWARD_OR_BACKWARD_INLINE;
var moveForwardInline = req.moveForwardInline;
var MOVE_BACKWARD_INLINE = req.MOVE_BACKWARD_INLINE;
var turnLeftRestricted = req.turnLeftRestricted;
var turnRightRestricted = req.turnRightRestricted;
var turnRightByConstant = req.turnRightByConstant;
var turnRight = req.turnRight;
var turnLeft = req.turnLeft;
var move = req.move;
var drawTurnRestricted = req.drawTurnRestricted;
var drawTurn = req.drawTurn;
var SET_COLOUR_PICKER = req.SET_COLOUR_PICKER;
var SET_COLOUR_RANDOM = req.SET_COLOUR_RANDOM;
var defineWithArg = req.defineWithArg;

var blocks = {
  SIMPLE_MOVE_UP: blockUtils.blockOfType('simple_move_up'),
  SIMPLE_MOVE_DOWN: blockUtils.blockOfType('simple_move_down'),
  SIMPLE_MOVE_LEFT: blockUtils.blockOfType('simple_move_left'),
  SIMPLE_MOVE_RIGHT: blockUtils.blockOfType('simple_move_right'),
  SIMPLE_JUMP_UP: blockUtils.blockOfType('simple_jump_up'),
  SIMPLE_JUMP_DOWN: blockUtils.blockOfType('simple_jump_down'),
  SIMPLE_JUMP_LEFT: blockUtils.blockOfType('simple_jump_left'),
  SIMPLE_JUMP_RIGHT: blockUtils.blockOfType('simple_jump_right'),
  SIMPLE_MOVE_UP_LENGTH: blockUtils.blockOfType('simple_move_up_length'),
  SIMPLE_MOVE_DOWN_LENGTH: blockUtils.blockOfType('simple_move_down_length'),
  SIMPLE_MOVE_LEFT_LENGTH: blockUtils.blockOfType('simple_move_left_length'),
  SIMPLE_MOVE_RIGHT_LENGTH: blockUtils.blockOfType('simple_move_right_length'),
  simpleMoveBlocks: function() {
    return this.SIMPLE_MOVE_UP +
      this.SIMPLE_MOVE_DOWN +
      this.SIMPLE_MOVE_LEFT +
      this.SIMPLE_MOVE_RIGHT;
  },
  simpleJumpBlocks: function() {
    return this.SIMPLE_JUMP_UP +
      this.SIMPLE_JUMP_DOWN +
      this.SIMPLE_JUMP_LEFT +
      this.SIMPLE_JUMP_RIGHT;
  },
  simpleMoveLengthBlocks: function() {
    return this.SIMPLE_MOVE_UP_LENGTH +
      this.SIMPLE_MOVE_DOWN_LENGTH +
      this.SIMPLE_MOVE_LEFT_LENGTH +
      this.SIMPLE_MOVE_RIGHT_LENGTH;
  }
};

/**
 * Information about level-specific requirements.
 */
module.exports = {
  // Level 1: El.
  '1_1': {
    answer: answer(1, 1),
    ideal: 4,
    toolbox: toolbox(1, 1),
    startBlocks: startBlocks(1, 1),
    requiredBlocks: [[MOVE_FORWARD_INLINE], [turnRightRestricted(90)]],
    freePlay: false
  },
  // Level 2: Square (without repeat).
  '1_2': {
    answer: answer(1, 2),
    ideal: 11,
    toolbox: toolbox(1, 2),
    startBlocks: startBlocks(1, 2),
    requiredBlocks: [
      [MOVE_FORWARD_INLINE],
      [turnRightRestricted(90)]
    ],
    freePlay: false
  },
  // Level 3: Square (with repeat).
  '1_3': {
    answer: answer(1, 3),
    ideal: 4,
    toolbox: toolbox(1, 3),
    startBlocks: startBlocks(1, 3),
    requiredBlocks: [
      [MOVE_FORWARD_INLINE],
      [turnRightRestricted(90)],
      [repeat(4)]
    ],
    freePlay: false
  },
  // Level 4: Triangle.
  '1_4': {
    answer: answer(1, 4),
    ideal: 6,
    toolbox: toolbox(1, 4),
    startBlocks: startBlocks(1, 4),
    requiredBlocks: [
      [MOVE_FORWARD_OR_BACKWARD_INLINE],
      [repeat(3)],
      [{
        // allow turn right or left, but show turn right block if they've done neither
        test: function(block) {
          return block.type == 'draw_turn_by_constant_restricted';
        },
        type: 'draw_turn_by_constant',
        titles: {VALUE: '???'}
      }]
    ],
    freePlay: false
  },
  // Level 5: Envelope.
  '1_5': {
    answer: answer(1, 5),
    ideal: 7,
    toolbox: toolbox(1, 5),
    startBlocks: startBlocks(1, 5),
    requiredBlocks: [
      [repeat(3)],
      [turnRightRestricted(120)],
      [MOVE_FORWARD_INLINE]
    ],
    freePlay: false
  },
  // Level 6: triangle and square.
  '1_6': {
    answer: answer(1, 6),
    ideal: 8,
    toolbox: toolbox(1, 6),
    startBlocks: startBlocks(1, 6),
    requiredBlocks: [
      [repeat(3)],
      [turnRightRestricted(120), turnLeftRestricted(120)],
      [MOVE_FORWARD_INLINE, MOVE_BACKWARD_INLINE]
    ],
    freePlay: false
  },
  // Level 7: glasses.
  '1_7': {
    answer: answer(1, 7),
    ideal: 13,
    toolbox: toolbox(1, 7),
    startBlocks: startBlocks(1, 7),
    requiredBlocks: [
      [drawTurnRestricted(90)],
      [MOVE_FORWARD_INLINE],
      [repeat(4)],
      [MOVE_BACKWARD_INLINE, MOVE_FORWARD_INLINE]
    ],
    freePlay: false,
    startDirection: 0
  },
  // Level 8: spikes.
  '1_8': {
    answer: answer(1, 8),
    ideal: 7,
    toolbox: toolbox(1, 8),
    startBlocks: startBlocks(1, 8),
    requiredBlocks: [[repeat(8)]],
    freePlay: false
  },
  // Level 9: circle.
  '1_9': {
    answer: answer(1, 9),
    ideal: 6,
    toolbox: toolbox(1, 9),
    startBlocks: startBlocks(1, 9),
    requiredBlocks: [],
    freePlay: false,
    sliderSpeed: 0.9,
    permittedErrors: 10,
    failForCircleRepeatValue: true
  },
  // Level 10: playground.
  '1_10': {
    answer: answer(1, 10),
    toolbox: toolbox(1, 10),
    startBlocks: startBlocks(1, 10),
    requiredBlocks: [],
    freePlay: true
  },
  // Formerly Page 2.
  // Level 1: Square.
  '2_1': {
    answer: answer(2, 1),
    ideal: 8,
    toolbox: toolbox(2, 1),
    startBlocks: startBlocks(2, 1),
    requiredBlocks: [
      [repeat(4)],
      [{
        // allow turn right or left, but show turn right block if they've done neither
        test: function(block) {
          return block.type == 'draw_turn';
        },
        type: 'draw_turn',
        titles: {'DIR': 'turnRight'},
        values: {'VALUE': makeMathNumber(90)}
      }],
      [{
        // allow move forward or backward, but show forward block if they've done neither
        test: function(block) {
          return block.type == 'draw_move';
        },
        type: 'draw_move',
        values: {'VALUE': makeMathNumber(100)}
      }]
    ],
    freePlay: false
  },
  // Level 2: Small green square.
  '2_2': {
    answer: answer(2, 2),
    ideal: 5,
    toolbox: toolbox(2, 2),
    startBlocks: startBlocks(2, 2),
    requiredBlocks: [
      [drawASquare('??')]
    ],
    freePlay: false
  },
  // Level 3: Three squares.
  '2_3': {
    answer: answer(2, 3),
    ideal: 8,
    toolbox: toolbox(2, 3),
    startBlocks: startBlocks(2, 3),
    requiredBlocks: [
      [repeat(3)],
      [drawASquare(100)],
      [drawTurn()]
    ],
    freePlay: false
  },
  // Level 4: 36 squares.
  '2_4': {
    answer: answer(2, 4),
    ideal: 8,
    toolbox: toolbox(2, 4),
    startBlocks: startBlocks(2, 4),
    freePlay: false,
    impressive: true
  },
  // Level 5: Different size squares.
  '2_5': {
    answer: answer(2, 5),
    ideal: 11,
    toolbox: toolbox(2, 5),
    startBlocks: startBlocks(2, 5),
    requiredBlocks: [
      [drawASquare('??')]
    ],
    freePlay: false
  },
  // Level 6: For-loop squares.
  '2_6': {
    answer: answer(2, 6),
    ideal: 7,
    toolbox: toolbox(2, 6),
    startBlocks: startBlocks(2, 6),
    // This is not displayed properly.
    requiredBlocks: [[simpleBlock('variables_get_counter')]],
    freePlay: false
  },
  // Level 7: Boxy spiral.
  '2_7': {
    minWorkspaceHeight: 1200,
    answer: answer(2, 7),
    ideal: 9,
    toolbox: toolbox(2, 7),
    startBlocks: startBlocks(2, 7),
    requiredBlocks: [
      [simpleBlock('controls_for_counter')],
      [move('??')],
      [simpleBlock('variables_get_counter')],
      [turnRight(90)]
    ],
    freePlay: false
  },
  // Prep for Level 8: Two snowmen.
  '2_7_5': {
    answer: answer(2, 7.5),
    initialY: 300,
    ideal: 5,
    toolbox: toolbox(2, 8),
    startBlocks: startBlocks(2, 7.5),
    requiredBlocks: [
      [drawASnowman(250)],
      [drawASnowman(100)]
    ],
    freePlay: false,
    sliderSpeed: 0.9,
    startDirection: 0
  },
  // Level 8: Three snowmen.
  '2_8': {
    answer: answer(2, 8),
    initialX: 100,
    ideal: 12,
    toolbox: toolbox(2, 8),
    startBlocks: startBlocks(2, 8),
    requiredBlocks: [
      [drawASnowman(150)],
      [turnRight(90)],
      [turnLeft(90)],
      [{
        test: 'jump',
        type: 'jump',
        values: {'VALUE': makeMathNumber(100)}
      }],
      [simpleBlock('jump')],
      [repeat(3)]
    ],
    freePlay: false,
    sliderSpeed: 0.9,
    startDirection: 0
  },
  // Level 9: Snowman family.
  '2_9': {
    answer: answer(2, 9),
    initialX: 100,
    ideal: 13,
    toolbox: toolbox(2, 9),
    startBlocks: startBlocks(2, 9),
    requiredBlocks: [
      [drawASnowman('??')],
      [simpleBlock('controls_for_counter')],
      [simpleBlock('variables_get_counter')],
      [turnRight(90)],
      [turnLeft(90)],
      [{
        test: 'jump',
        type: 'jump',
        values: {'VALUE': makeMathNumber(60)}
      }]
    ],
    freePlay: false,
    sliderSpeed: 0.9,
    startDirection: 0
  },
  // Level 10: playground.
  '2_10': {
    answer: answer(2, 10),
    freePlay: true,
    toolbox: toolbox(2, 10),
    startBlocks: startBlocks(2, 10)
  },
  // Formerly Page 3.
  // Level 1: Call 'draw a square'.
  '3_1': {
    answer: answer(3, 1),
    ideal: 14,
    toolbox: toolbox(3, 1),
    startBlocks: startBlocks(3, 1),
    requiredBlocks: [
      [levelBase.call(msg.drawASquare())]
    ],
    freePlay: false
  },
  // Level 2: Create "draw a triangle".
  '3_2': {
    answer: answer(3, 2),
    ideal: 14,
    toolbox: toolbox(3, 2),
    startBlocks: startBlocks(3, 2),
    requiredBlocks: [
      [repeat(3)],
      [move(100)],
      [turnRight(120)],
      [levelBase.call(msg.drawATriangle())]
    ],
    freePlay: false
  },
  // Level 3: Fence the animals.
  '3_3': {
    answer: answer(3, 3),
    initialY: 350,
    ideal: 20,
    toolbox: toolbox(3, 3),
    startBlocks: startBlocks(3, 3),
    requiredBlocks: [
      [levelBase.call(msg.drawATriangle())],
      [move(100)],
      [levelBase.call(msg.drawASquare())]
    ],
    freePlay: false,
    images: [
      {
        filename: 'cat.svg',
        position: [170, 247]
      },
      {
        filename: 'cat.svg',
        position: [170, 47]
      },
      {
        filename: 'cow.svg',
        position: [182, 147]
      }
    ],
    startDirection: 0
  },
  // Level 4: House the lion.
  '3_4': {
    answer: answer(3, 4),
    ideal: 19,
    toolbox: toolbox(3, 4),
    startBlocks: startBlocks(3, 4),
    requiredBlocks: [
      [levelBase.call(msg.drawASquare())],
      [move(100)],
      [turnRight(30)],
      [levelBase.call(msg.drawATriangle())]
    ],
    freePlay: false,
    images: [
      {
        filename: 'lion.svg',
        position: [195, 97]
      }
    ],
    startDirection: 0
  },
  // Level 5: Create "draw a house".
  '3_5': {
    answer: answer(3, 5),
    ideal: 21,
    toolbox: toolbox(3, 5),
    startBlocks: startBlocks(3, 5),
    requiredBlocks: [
      [levelBase.define(msg.drawAHouse())],
      [levelBase.call(msg.drawASquare())],
      [move(100)],
      [turnRight(30)],
      [levelBase.call(msg.drawATriangle())],
      [levelBase.call(msg.drawAHouse())]
    ],
    freePlay: false,
    images: [
      {
        filename: 'cat.svg',
        position: [170, 90]
      },
      {
        filename: 'cat.svg',
        position: [222, 90]
      }
    ],
    startDirection: 0
  },
  // Level 6: Add parameter to "draw a triangle".
  '3_6': {
    answer: answer(3, 6),
    initialY: 350,
    ideal: 23,
    toolbox: toolbox(3, 6),
    startBlocks: startBlocks(3, 6),
    requiredBlocks: [
      [defineWithArg(msg.drawATriangle(), msg.lengthParameter())],
      [simpleBlock('variables_get_length')],
      [levelBase.callWithArg(msg.drawATriangle(), msg.lengthParameter())]
    ],
    disableParamEditing: false,
    freePlay: false,
    images: [
      {
        filename: 'lion.svg',
        position: [185, 100]
      },
      {
        filename: 'cat.svg',
        position: [175, 248]
      }
    ],
    startDirection: 0
  },
  // Level 7: Add parameter to "draw a house".
  '3_7': {
    answer: answer(3, 7),
    initialY: 350,
    ideal: 24,
    toolbox: toolbox(3, 7),
    startBlocks: startBlocks(3, 7),
    requiredBlocks: [
      [defineWithArg(msg.drawAHouse(), msg.lengthParameter())],
      [levelBase.callWithArg(msg.drawASquare(), msg.lengthParameter())],
      [levelBase.callWithArg(msg.drawATriangle(), msg.lengthParameter())],
      [simpleBlock('variables_get_length')],
      [levelBase.callWithArg(msg.drawAHouse(), msg.lengthParameter())]
    ],
    freePlay: false,
    images: [
      {
        filename: 'elephant.svg',
        position: [205, 220]
      }
    ],
    startDirection: 0,
    disableParamEditing: false
  },
  // Level 8: Draw houses.
  '3_8': {
    minWorkspaceHeight: 1200,
    answer: answer(3, 8),
    initialX: 20,
    initialY: 350,
    ideal: 40,
    toolbox: toolbox(3, 8),
    startBlocks: startBlocks(3, 8),
    freePlay: false,
    images: [
      {
        filename: 'cat.svg',
        position: [16, 170]
      },
      {
        filename: 'lion.svg',
        position: [15, 250]
      },
      {
        filename: 'elephant.svg',
        position: [127, 220]
      },
      {
        filename: 'cow.svg',
        position: [255, 250]
      }
    ],
    startDirection: 0,
    disableParamEditing: false
  },
  // Level 9: Draw houses with for loop.
  '3_9': {
    minWorkspaceHeight: 1200,
    answer: answer(3, 9),
    initialX: 20,
    initialY: 350,
    ideal: 40,
    toolbox: toolbox(3, 9),
    startBlocks: startBlocks(3, 9),
    requiredBlocks: [
      [simpleBlock('controls_for_counter')],
      [simpleBlock('variables_get_counter')]
    ],
    freePlay: false,
    images: [
      {
        filename: 'cat.svg',
        position: [-10, 270]
      },
      {
        filename: 'cow.svg',
        position: [53, 250]
      },
      {
        filename: 'elephant.svg',
        position: [175, 220]
      }
    ],
    failForTooManyBlocks: true,
    startDirection: 0,
    disableParamEditing: false
  },
  // Level 10: playground.
  '3_10': {
    minWorkspaceHeight: 1600,
    answer: answer(3, 10),
    freePlay: true,
    toolbox: toolbox(3, 10),
    startBlocks: startBlocks(3, 10)
  },
  // Formerly Page 4.
  // Level 1: One triangle.
  '4_1': {
    answer: answer(4, 1),
    ideal: 4,
    toolbox: toolbox(4, 1),
    startBlocks: startBlocks(4, 1),
    requiredBlocks: [
      [MOVE_FORWARD_OR_BACKWARD_INLINE],
      [repeat(3)],
      [{
        // allow turn right or left, but show turn right block if they've done neither
        test: function(block) {
          return block.type == 'draw_turn_by_constant';
        },
        type: 'draw_turn_by_constant',
        titles: {VALUE: '???'}
      }]
    ],
  },
  // Level 2: Two triangles.
  '4_2': {
    answer: answer(4, 2),
    ideal: 12,
    toolbox: toolbox(4, 2),
    startBlocks: startBlocks(4, 2),
    requiredBlocks: [
      [turnRightByConstant('???')]
    ],
    sliderSpeed: 0.5
  },
  // Level 3: Four triangles using repeat.
  '4_3': {
    answer: answer(4, 3),
    ideal: 8,
    toolbox: toolbox(4, 3),
    startBlocks: startBlocks(4, 3),
    requiredBlocks: [
      [repeat(4)],
      [turnRightByConstant('???')]
    ],
    sliderSpeed: 0.7
  },
  // Level 4: Ten triangles with missing repeat number.
  '4_4': {
    answer: answer(4, 4),
    ideal: 8,
    toolbox: toolbox(4, 4),
    startBlocks: startBlocks(4, 4),
    requiredBlocks: [
      [repeat('???')]
    ],
    sliderSpeed: 0.7,
    impressive: true
  },
  // Level 5: 36 triangles with missing angle number.
  '4_5': {
    answer: answer(4, 5),
    ideal: 8,
    toolbox: toolbox(4, 5),
    startBlocks: startBlocks(4, 5),
    requiredBlocks: [
      [turnRightByConstant('???')]
    ],
    sliderSpeed: 0.9,
    impressive: true
  },
  // Level 6: 1 square.
  '4_6': {
    answer: answer(4, 6),
    ideal: 4,
    toolbox: toolbox(4, 6),
    startBlocks: startBlocks(4, 6),
    requiredBlocks: [
      [moveForwardInline(20)],
      [repeat(4)],
      [{
        test: 'turnRight',
        type: 'draw_turn_by_constant',
        titles: {VALUE: '???'}
      }]
    ],
    permittedErrors: 10,
    startDirection: 0
  },
  // Level 7: Square Ladder.
  '4_7': {
    answer: answer(4, 7),
    initialY: 300,
    ideal: 8,
    toolbox: toolbox(4, 7),
    startBlocks: startBlocks(4, 7),
    requiredBlocks: [
      [moveForwardInline(20)],
      [repeat(10)]
    ],
    startDirection: 0,
    sliderSpeed: 0.7
  },
  // Level 8: Ladder square.
  '4_8': {
    answer: answer(4, 8),
    initialX: 100,
    initialY: 300,
    ideal: 10,
    toolbox: toolbox(4, 8),
    startBlocks: startBlocks(4, 8),
    requiredBlocks: [
      [repeat(4)],
      [turnRightByConstant('???')]
    ],
    startDirection: 0,
    sliderSpeed: 0.9
  },
  // Level 9: Ladder square with a different angle.
  '4_9': {
    answer: answer(4, 9),
    initialX: 150,
    initialY: 350,
    ideal: 10,
    toolbox: toolbox(4, 9),
    startBlocks: startBlocks(4, 9),
    requiredBlocks: [
      [turnRightByConstant('???')]
    ],
    startDirection: 330,
    sliderSpeed: 0.9
  },
  // Level 10: Ladder polygon.
  '4_10': {
    answer: answer(4, 10),
    initialX: 75,
    initialY: 300,
    ideal: 10,
    toolbox: toolbox(4, 10),
    startBlocks: startBlocks(4, 10),
    requiredBlocks: [
      [repeat('???')]
    ],
    startDirection: 0,
    sliderSpeed: 0.9,
    impressive: true
  },
  // Level 11: playground.
  '4_11': {
    answer: answer(4, 11),
    freePlay: true,
    initialX: 75,
    initialY: 300,
    toolbox: toolbox(4, 11),
    startBlocks: startBlocks(4, 11),
    requiredBlocks : [],
    startDirection: 0,
    sliderSpeed: 0.9
   },

  // Formerly Page 5.
  // Level 1: playground.
  '5_1': {
    minWorkspaceHeight: 1200,
    answer: answer(5, 1),
    freePlay: true,
    toolbox: toolbox(5, 1),
    startBlocks: startBlocks(5, 1),
    sliderSpeed: 0.9
  },
  // Level 2: playground.
  '5_2': {
    minWorkspaceHeight: 1200,
    answer: answer(5, 2),
    freePlay: true,
    toolbox: toolbox(5, 2),
    startBlocks: startBlocks(5, 2),
    sliderSpeed: 1.0
  },
  // Level 3: playground.
  '5_3': {
    minWorkspaceHeight: 1200,
    answer: answer(5, 3),
    freePlay: true,
    toolbox: toolbox(5, 3),
    startBlocks: startBlocks(5, 3),
    sliderSpeed: 1.0
  },
  // Level 4: playground.
  '5_4': {
    minWorkspaceHeight: 1600,
    answer: answer(5, 4),
    freePlay: true,
    toolbox: toolbox(5, 4),
    startBlocks: startBlocks(5, 4),
    sliderSpeed: 1.0
  },
  // Level 5: playground.
  '5_5': {
    minWorkspaceHeight: 1600,
    answer: answer(5, 5),
    freePlay: true,
    toolbox: toolbox(5, 5),
    startBlocks: blockUtils.blockOfType('functional_plus') + blockUtils.blockOfType('functional_math_number'),
    sliderSpeed: 1.0
  },
  // Level 6: playground.
  '5_6': {
    minWorkspaceHeight: 1600,
    answer: answer(5, 6),
    freePlay: true,
    initialY: 300,
    toolbox: toolbox(5, 6),
    startBlocks: startBlocks(5, 6),
    startDirection: 0,
    sliderSpeed: 1.0
  },
  // The level for building new levels.
  'builder': {
    answer: [],
    freePlay: true,
    initialY: 300,
    toolbox: toolbox(5, LEVELBUILDER_LEVEL),
    startBlocks: '',
    startDirection: 0,
    sliderSpeed: 1.0
  },
  // The default level newly created levels use.
  'custom': {
    answer: [],
    freePlay: false,
    initialY: 300,
    toolbox: toolbox(5, LEVELBUILDER_LEVEL),
    startBlocks: '',
    startDirection: 0,
    sliderSpeed: 1.0
  },
  'k1_demo': {
    answer: [],
    freePlay: false,
    initialY: 300,
    isK1: true,
    toolbox: blockUtils.createToolbox(
        blocks.simpleMoveBlocks() +
        blocks.simpleJumpBlocks() +
        blocks.simpleMoveLengthBlocks() +
        blockUtils.blockOfType('controls_repeat_simplified') +
        blockUtils.blockOfType('draw_colour_simple')
      ),
    startBlocks: '',
    startDirection: 0,
    sliderSpeed: 1.0
  }
};
