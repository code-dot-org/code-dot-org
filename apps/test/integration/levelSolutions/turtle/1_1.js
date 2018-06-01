import {TestResults} from '@cdo/apps/constants';


var rblocks = function () {
  // stick this inside a function so that it's only loaded when needed
  return require('@cdo/apps/turtle/requiredBlocks.js');
};

var studioApp = require('@cdo/apps/StudioApp').singleton;

var solution = '<block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title><next><block type="draw_turn_by_constant_restricted"><title name="DIR">turnRight</title><title name="VALUE">90</title><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></next></block>';

module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "1_1",
  tests: [
    {
      description: "Expected solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function () {
        return studioApp().enableShowCode === true && studioApp().enableShowBlockCount === true;
      },
      missingBlocks: [],
      xml:
        '<xml>' +
        solution +
        '</xml>'
    },
    {
      description: "Solution using more than the ideal number of blocks",
      expected: {
        result: true,
        testResult: TestResults.TOO_MANY_BLOCKS_FAIL
      },
      missingBlocks: [],
      xml:
      `<xml>
        <block type="when_run">
          <next>
            <block type="jump_by_constant_dropdown">
              <title name="DIR">jumpBackward</title>
              <title name="VALUE">50</title>
              <next>
                <block type="jump_by_constant_dropdown">
                  <title name="DIR">jumpForward</title>
                  <title name="VALUE">50</title>
                  <next>
                    <block type="draw_move_by_constant">
                      <title name="DIR">moveForward</title>
                      <title name="VALUE">100</title>
                      <next>
                        <block type="draw_turn_by_constant_restricted">
                          <title name="DIR">turnRight</title>
                          <title name="VALUE">90</title>
                          <next>
                            <block type="draw_move_by_constant">
                              <title name="DIR">moveForward</title>
                              <title name="VALUE">100</title>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </next>
        </block>
      </xml>`
    },
    {
      description: "User doesnt add any blocks.  Should fail.",
      expected: {
        result: false,
        testResult: TestResults.MISSING_BLOCK_UNFINISHED
      },
      missingBlocks: [rblocks().turnRightRestricted(90)],
      xml: '<xml><block type="when_run"><next><block type="draw_move_by_constant"><title name="DIR">moveForward</title><title name="VALUE">100</title></block></next></block></xml>'
    },
    {
      description: "Empty workspace.",
      missingBlocks: [rblocks().MOVE_FORWARD_INLINE],
      xml: ''
    },
    {
      // floating top block ignores ???
      description: "extra ??? block",
      expected: {
        result: true,
        testResult: TestResults.PASS_WITH_EXTRA_TOP_BLOCKS
      },
      xml:
        '<xml>' +
        solution +
        '<block type="math_number"><title name="NUM">???</title></block>' +
        '</xml>'
    }
  ]
};
