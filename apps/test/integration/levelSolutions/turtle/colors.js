import { TestResults } from '@cdo/apps/constants.js';

const setColor = `
  <xml>
    <block type="when_run" deletable="false" movable="false">
      <next>
        <block type="controls_repeat">
          <title name="TIMES">4</title>
          <statement name="DO">
            <block type="draw_colour" inline="true" id="draw-color">
              <value name="COLOUR">
                <block type="colour_picker">
                  <title name="COLOUR">#ff0000</title>
                </block>
              </value>
              <next>
                <block type="draw_move_by_constant">
                  <title name="DIR">moveForward</title>
                  <title name="VALUE">100</title>
                  <next>
                    <block type="draw_turn_by_constant">
                      <title name="DIR">turnRight</title>
                      <title name="VALUE">90</title>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </statement>
        </block>
      </next>
    </block>
  </xml>
`;

const noSetColor = `
  <xml>
    <block type="when_run" deletable="false" movable="false">
      <next>
        <block type="controls_repeat">
          <title name="TIMES">4</title>
          <statement name="DO">
            <block type="draw_move_by_constant">
              <title name="DIR">moveForward</title>
              <title name="VALUE">100</title>
              <next>
                <block type="draw_turn_by_constant">
                  <title name="DIR">turnRight</title>
                  <title name="VALUE">90</title>
                </block>
              </next>
            </block>
          </statement>
        </block>
      </next>
    </block>
  </xml>
`;

const setRandomColor = `
  <xml>
    <block type="when_run" deletable="false" movable="false">
      <next>
        <block type="controls_repeat">
          <title name="TIMES">4</title>
          <statement name="DO">
            <block type="draw_colour" inline="true" id="draw-color">
              <value name="COLOUR">
                <block type="colour_random"></block>
              </value>
              <next>
                <block type="draw_move_by_constant">
                  <title name="DIR">moveForward</title>
                  <title name="VALUE">100</title>
                  <next>
                    <block type="draw_turn_by_constant">
                      <title name="DIR">turnRight</title>
                      <title name="VALUE">90</title>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </statement>
        </block>
      </next>
    </block>
  </xml>
`;

const levelDef = {
  solutionBlocks: noSetColor,
  ideal: Infinity,
  toolbox: null,
  freePlay: false,
};

module.exports = {
  app: "turtle",
  skinId: "artist",
  levelDefinition: levelDef,

  tests: [{
    description: "Level With Set Color: setting color in user code but not answer doesn't invalidate solution",
    expected: {
      testResult: TestResults.ALL_PASS
    },
    xml: setColor
  }, {
    description: "Level With Set Color: using random color doesn't invalidate solution",
    expected: {
      testResult: TestResults.ALL_PASS
    },
    xml: setRandomColor
  }]
};

