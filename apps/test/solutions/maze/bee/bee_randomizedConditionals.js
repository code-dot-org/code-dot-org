var testUtils = require('../../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');

// Bee level in which we have one of each randomized conditional
var levelDef = {
  'map': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 2, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  'startDirection': 1, // Direction.EAST,
  'initialDirt': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  'rawDirt': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 2, "+1C", "-1C", "1C", "1Cany", 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  flowerType: 'redWithNectar'
};

module.exports = {
  app: "maze",
  skinId: 'bee',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Try to get honey, assuming that !flower -> honey",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === 3; //TerminationValue.NOT_AT_HONEYCOMB;
      },
      xml: '<xml>' +
          '<block type="controls_repeat">' +
          '  <title name="TIMES">4</title>' +
          '  <statement name="DO">' +
          '    <block type="maze_moveForward">' +
          '      <next>' +
          '        <block type="bee_ifElseFlower">' +
          '          <title name="LOC">atFlower</title>' +
          '          <statement name="DO">' +
          '            <block type="maze_nectar"></block>' +
          '          </statement>' +
          '          <statement name="ELSE">' +
          '            <block type="maze_honey"></block>' +
          '          </statement>' +
          '        </block>' +
          '      </next>' +
          '    </block>' +
          '  </statement>' +
          '</block>' +
        '</xml>'
    },
    {
      description: "Check every cell before getting flower or honey",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
          '<block type="controls_repeat">' +
          '  <title name="TIMES">4</title>' +
          '  <statement name="DO">' +
          '    <block type="maze_moveForward">' +
          '      <next>' +
          '        <block type="bee_ifElseFlower">' +
          '          <title name="LOC">atFlower</title>' +
          '          <statement name="DO">' +
          '            <block type="maze_nectar"></block>' +
          '          </statement>' +
          '          <statement name="ELSE">' +
          '            <block type="bee_ifFlower">' +
          '              <title name="LOC">atHoneycomb</title>' +
          '              <statement name="DO">' +
          '                <block type="maze_honey"></block>' +
          '              </statement>' +
          '            </block>' +
          '          </statement>' +
          '        </block>' +
          '      </next>' +
          '    </block>' +
          '  </statement>' +
          '</block>' +
        '</xml>'
    }
  ]
};
