import {TestResults} from '@cdo/apps/constants.js';

const patternsOnly = '<xml><block type="when_run" deletable="false" movable="false"><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">20</title><next><block type="draw_line_style_pattern"><title name="VALUE">swirlyLine</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">60</title><next><block type="draw_line_style_pattern"><title name="VALUE">ropeLine</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">100</title><next><block type="draw_line_style_pattern"><title name="VALUE">squigglyLine</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>';
const stickersOnly = '<xml><block type="when_run" deletable="false" movable="false"><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">200</title><next><block type="sticker"><title name="VALUE">Giraffe</title><next><block type="jump_by_constant"><title name="DIR">jumpForward</title><title name="VALUE">100</title><next><block type="sticker"><title name="VALUE">Dinosaur</title><next><block type="jump_by_constant"><title name="DIR">jumpForward</title><title name="VALUE">100</title><next><block type="sticker"><title name="VALUE">Monster</title></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>';
const both = '<xml><block type="when_run" deletable="false" movable="false"><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">20</title><next><block type="draw_line_style_pattern"><title name="VALUE">swirlyLine</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">60</title><next><block type="draw_line_style_pattern"><title name="VALUE">ropeLine</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">100</title><next><block type="draw_line_style_pattern"><title name="VALUE">squigglyLine</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">200</title><next><block type="sticker"><title name="VALUE">Giraffe</title><next><block type="jump_by_constant"><title name="DIR">jumpForward</title><title name="VALUE">100</title><next><block type="sticker"><title name="VALUE">Dinosaur</title><next><block type="jump_by_constant"><title name="DIR">jumpForward</title><title name="VALUE">100</title><next><block type="sticker"><title name="VALUE">Monster</title></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>';
const bothButDifferent = '<xml><block type="when_run" deletable="false" movable="false"><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">20</title><next><block type="draw_line_style_pattern"><title name="VALUE">DEFAULT</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">60</title><next><block type="draw_line_style_pattern"><title name="VALUE">squigglyLine</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">100</title><next><block type="draw_line_style_pattern"><title name="VALUE">rainbowLine</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">200</title><next><block type="sticker"><title name="VALUE">Alien</title><next><block type="jump_by_constant"><title name="DIR">jumpForward</title><title name="VALUE">100</title><next><block type="sticker"><title name="VALUE">Dog</title><next><block type="jump_by_constant"><title name="DIR">jumpForward</title><title name="VALUE">100</title><next><block type="sticker"><title name="VALUE">Peacock</title></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>';
const linesAndStickers = '<xml><block type="when_run" deletable="false" movable="false"><next><block type="draw_turn_by_constant"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">20</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">60</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">100</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">200</title><next><block type="jump_to_xy"><title name="XPOS">20</title><title name="YPOS">200</title><next><block type="sticker"><title name="VALUE">Wizard</title><next><block type="jump_by_constant"><title name="DIR">jumpForward</title><title name="VALUE">100</title><next><block type="sticker"><title name="VALUE">Tennisgirl</title><next><block type="jump_by_constant"><title name="DIR">jumpForward</title><title name="VALUE">100</title><next><block type="sticker"><title name="VALUE">Bat</title></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>';

const levelDef = {
  solutionBlocks: both,
  ideal: Infinity,
  toolbox: null,
  freePlay: false,
};

module.exports = {
  app: "turtle",
  skinId: "artist",
  levelDefinition: levelDef,

  tests: [{
    description: "Level With Pattern And Sticker: Allows for solution with different patterns and stickers",
    expected: {
      testResult: TestResults.ALL_PASS
    },
    xml: bothButDifferent
  }, {
    description: "Level With Pattern And Sticker: Requires that some sticker be used",
    expected: {
      testResult: TestResults.LEVEL_INCOMPLETE_FAIL
    },
    xml: patternsOnly,
  }, {
    description: "Level With Pattern And Sticker: Requires that some line be drawn",
    expected: {
      testResult: TestResults.LEVEL_INCOMPLETE_FAIL
    },
    xml: stickersOnly
  }, {
    description: "Level With Pattern And Sticker: Allows for regular lines in place of patterns",
    expected: {
      testResult: TestResults.ALL_PASS
    },
    xml: linesAndStickers
  }]
};

