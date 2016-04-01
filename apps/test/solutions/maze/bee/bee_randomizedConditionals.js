var testUtils = require('../../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');

// Bee level in which we have one of each randomized conditional
var levelDef = {
  'startDirection': 1, // Direction.EAST,
  'serializedMaze': [
    [{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0}],
    [{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0}],
    [{"tileType": 0},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 0}],
    [{"tileType": 0},{"tileType": 2},{"tileType": 1,"featureType": 2,"value": 1,"cloudType": 1,"range": 1},{"tileType": 1,"featureType": 2,"value": 1,"cloudType": 2,"range": 1},{"tileType": 1,"featureType": 2,"value": 1,"cloudType": 3,"range": 1},{"tileType": 1,"featureType": 1,"value": 1,"cloudType": 4,"range": 1},{"tileType": 1},{"tileType": 0}],
    [{"tileType": 0},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 0}],
    [{"tileType": 0},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 1},{"tileType": 0}],
    [{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0}],
    [{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0},{"tileType": 0}]
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
