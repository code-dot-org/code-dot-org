import { TestResults } from '@cdo/apps/constants';

const levelDef = {
  'startDirection': 1, // Direction.EAST,
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
      description: "Collector collected nothing",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: () => Maze.executionInfo.terminationValue() === 1, // COLLECTED_NOTHING
      xml: '<xml></xml>'
    },
    {
      description: "Collector collected just some",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL
      },
      customValidator: () => Maze.executionInfo.terminationValue() === 2, // COLLECTED_SOME
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
      description: "Collector collected all",
      expected: {
        result: false,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
            '  <block type="when_run">' +
            '    <next>' +
            '      <block type="controls_repeat">' +
            '        <title name="TIMES">3</title>' +
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
    {
      description: "Collector used too many blocks",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: () => Maze.executionInfo.terminationValue() === 0, // TOO_MANY_BLOCKS
      xml: '<xml>' +
            '  <block type="when_run">' +
            '    <next>' +
            '      <block type="maze_moveForward">' +
            '        <next>' +
            '          <block type="collector_collect">' +
            '            <next>' +
            '              <block type="maze_moveForward">' +
            '                <next>' +
            '                  <block type="collector_collect">' +
            '                    <next>' +
            '                      <block type="maze_moveForward">' +
            '                        <next>' +
            '                          <block type="collector_collect"></block>' +
            '                        </next>' +
            '                      </block>' +
            '                    </next>' +
            '                  </block>' +
            '                </next>' +
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
