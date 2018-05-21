import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  'startDirection': 1, // Direction.EAST,
  'minCollected': 2,
  'ideal': 4,
  'serializedMaze': [
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":0}],
    [{"tileType":0},{"tileType":2},{"tileType":1,"value":1},{"tileType":1,"value":1},{"tileType":1, "value": 1},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":0}],
    [{"tileType":0},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":1},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}]
  ],
};

module.exports = {
  app: "maze",
  skinId: 'collector',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Collector collected less than minimum requirement",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: () => Maze.executionInfo.terminationValue() === 5, // COLLECTED_NOT_ENOUGH
      xml: '<xml>' +
           '  <block type="when_run">' +
           '    <next>' +
           '      <block type="maze_moveForward">' +
           '        <next>' +
           '          <block type="collector_collect"></block>' +
           '        </next>' +
           '      </block>' +
           '    </next>' +
           '  </block>' +
           '</xml>'
    },
    {
      description: "Collector met minimum requirement but did not collect all",
      expected: {
        result: true,
        testResult: TestResults.APP_SPECIFIC_IMPERFECT_PASS
      },
      customValidator: () => Maze.executionInfo.terminationValue() === 6, // COLLECTED_ENOUGH_BUT_NOT_ALL
      xml: '<xml>' +
            '  <block type="when_run">' +
            '    <next>' +
            '      <block type="controls_repeat">' +
            '        <title name="TIMES">2</title>' +
            '        <statement name="DO">' +
            '          <block type="maze_moveForward">' +
            '            <next>' +
            '              <block type="collector_collect"></block>' +
            '            </next>' +
            '          </block>' +
            '        </statement>' +
            '      </block>' +
            '    </next>' +
            '  </block>' +
            '</xml>'
    },
  ]
};

