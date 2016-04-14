var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');

// Farmer level in which we have a randomized range
var levelDef = {
  'startDirection': 2, // Direction.SOUTH,
  'serializedMaze': [
    [{"tileType":1},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1}],
    [{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1}],
    [{"tileType":0},{"tileType":1},{"tileType":2},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1,"value":-5,"range":-6},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":0}],
    [{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1},{"tileType":1}],
    [{"tileType":1},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1}]
  ],
};

module.exports = {
  app: "maze",
  skinId: 'farmer',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Try to use a repeat 5 loop",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml: '<xml>' +
          '  <block type="maze_moveForward">' +
          '    <next>' +
          '      <block type="maze_turn">' +
          '        <title name="DIR">turnLeft</title>' +
          '        <next>' +
          '          <block type="maze_moveForward">' +
          '            <next>' +
          '              <block type="controls_repeat">' +
          '                <title name="TIMES">5</title>' +
          '                <statement name="DO">' +
          '                  <block type="maze_fill"></block>' +
          '                </statement>' +
          '              </block>' +
          '            </next>' +
          '          </block>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>'
    },

    {
      description: "Try to use a repeat 6 loop",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml: '<xml>' +
          '  <block type="maze_moveForward">' +
          '    <next>' +
          '      <block type="maze_turn">' +
          '        <title name="DIR">turnLeft</title>' +
          '        <next>' +
          '          <block type="maze_moveForward">' +
          '            <next>' +
          '              <block type="controls_repeat">' +
          '                <title name="TIMES">6</title>' +
          '                <statement name="DO">' +
          '                  <block type="maze_fill"></block>' +
          '                </statement>' +
          '              </block>' +
          '            </next>' +
          '          </block>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>'
    },

    {
      description: "Use a While loop",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },

      xml: '<xml>' +
          '  <block type="maze_moveForward">' +
          '    <next>' +
          '      <block type="maze_turn">' +
          '        <title name="DIR">turnLeft</title>' +
          '        <next>' +
          '          <block type="maze_moveForward">' +
          '            <next>' +
          '              <block type="maze_untilBlockedOrNotClear">' +
          '                <title name="DIR">holePresent</title>' +
          '                <statement name="DO">' +
          '                  <block type="maze_fill"></block>' +
          '                </statement>' +
          '              </block>' +
          '            </next>' +
          '          </block>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>'
    }
  ]
};
