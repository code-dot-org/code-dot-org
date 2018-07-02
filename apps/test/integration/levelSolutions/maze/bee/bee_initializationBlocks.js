import {TestResults} from '@cdo/apps/constants';

// Bee level which requires initialization blocks to work
// inspired by Course 4 Bee Params 5: https://studio.code.org/s/course4/stage/16/puzzle/5
var levelDef = {
  'startDirection': 2, // Direction.SOUTH,
  'serializedMaze': [
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":2},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":1,"value":5,"range":5,"featureType":1},{"tileType":1},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1},{"tileType":1,"value":5,"range":5,"featureType":1},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":1,"value":5,"range":5,"featureType":1},{"tileType":1},{"tileType":1},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":1},{"tileType":1},{"tileType":1,"value":5,"range":5,"featureType":1},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}],
    [{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0},{"tileType":0}]
  ],
  flowerType: 'redWithNectar',
  initializationBlocks: '<block type="when_run">' +
      '<next>' +
        '<block type="variables_set" inline="false">' +
          '<title name="VAR">left</title>' +
          '<value name="VALUE">' +
            '<block type="math_number">' +
              '<title name="NUM">0</title>' +
            '</block>' +
          '</value>' +
          '<next>' +
            '<block type="variables_set" inline="false">' +
              '<title name="VAR">right</title>' +
              '<value name="VALUE">' +
                '<block type="math_number">' +
                  '<title name="NUM">1</title>' +
                '</block>' +
              '</value>' +
            '</block>' +
          '</next>' +
        '</block>' +
      '</next>' +
    '</block>'
};

module.exports = {
  app: "maze",
  skinId: 'bee',
  levelDefinition: levelDef,
  tests: [{
    description: "Run with initialization blocks.",
    expected: {
      result: true,
      testResult: TestResults.ALL_PASS
    },
    xml: '<xml>' +
      '<block type="when_run" deletable="false" movable="false">' +
        '<next>' +
          '<block type="controls_repeat">' +
            '<title name="TIMES">2</title>' +
            '<statement name="DO">' +
              '<block type="procedures_callnoreturn" inline="false">' +
                '<mutation name="get 5 nectar">' +
                  '<arg name="direction"></arg>' +
                '</mutation>' +
                '<value name="ARG0">' +
                  '<block type="variables_get">' +
                    '<title name="VAR">left</title>' +
                  '</block>' +
                '</value>' +
                '<next>' +
                  '<block type="procedures_callnoreturn" inline="false">' +
                    '<mutation name="get 5 nectar">' +
                      '<arg name="direction"></arg>' +
                    '</mutation>' +
                    '<value name="ARG0">' +
                      '<block type="variables_get">' +
                        '<title name="VAR">right</title>' +
                      '</block>' +
                    '</value>' +
                  '</block>' +
                '</next>' +
              '</block>' +
            '</statement>' +
          '</block>' +
        '</next>' +
      '</block>' +
      '<block type="procedures_defnoreturn" editable="false" usercreated="true">' +
        '<mutation>' +
          '<arg name="direction"></arg>' +
        '</mutation>' +
        '<title name="NAME">get 5 nectar</title>' +
        '<statement name="STACK">' +
          '<block type="maze_move">' +
            '<title name="DIR">moveForward</title>' +
            '<next>' +
              '<block type="controls_if" inline="false">' +
                '<mutation else="1"></mutation>' +
                '<value name="IF0">' +
                  '<block type="logic_compare" inline="true" movable="false">' +
                    '<title name="OP">EQ</title>' +
                    '<value name="A">' +
                      '<block type="parameters_get">' +
                        '<title name="VAR">direction</title>' +
                      '</block>' +
                    '</value>' +
                    '<value name="B">' +
                      '<block type="variables_get">' +
                        '<title name="VAR">left</title>' +
                      '</block>' +
                    '</value>' +
                  '</block>' +
                '</value>' +
                '<statement name="DO0">' +
                  '<block type="maze_turn">' +
                    '<title name="DIR">turnRight</title>' +
                  '</block>' +
                '</statement>' +
                '<statement name="ELSE">' +
                  '<block type="maze_turn">' +
                    '<title name="DIR">turnLeft</title>' +
                  '</block>' +
                '</statement>' +
                '<next>' +
                  '<block type="controls_repeat">' +
                    '<title name="TIMES">2</title>' +
                    '<statement name="DO">' +
                      '<block type="maze_move">' +
                        '<title name="DIR">moveForward</title>' +
                      '</block>' +
                    '</statement>' +
                    '<next>' +
                      '<block type="controls_repeat">' +
                        '<title name="TIMES">5</title>' +
                        '<statement name="DO">' +
                          '<block type="maze_nectar"></block>' +
                        '</statement>' +
                        '<next>' +
                          '<block type="controls_repeat">' +
                            '<title name="TIMES">2</title>' +
                            '<statement name="DO">' +
                              '<block type="maze_move">' +
                                '<title name="DIR">moveBackward</title>' +
                              '</block>' +
                            '</statement>' +
                            '<next>' +
                              '<block type="controls_if" inline="false">' +
                                '<mutation else="1"></mutation>' +
                                '<value name="IF0">' +
                                  '<block type="logic_compare" inline="true" movable="false">' +
                                    '<title name="OP">EQ</title>' +
                                    '<value name="A">' +
                                      '<block type="parameters_get">' +
                                        '<title name="VAR">direction</title>' +
                                      '</block>' +
                                    '</value>' +
                                    '<value name="B">' +
                                      '<block type="variables_get">' +
                                        '<title name="VAR">left</title>' +
                                      '</block>' +
                                    '</value>' +
                                  '</block>' +
                                '</value>' +
                                '<statement name="DO0">' +
                                  '<block type="maze_turn">' +
                                    '<title name="DIR">turnLeft</title>' +
                                  '</block>' +
                                '</statement>' +
                                '<statement name="ELSE">' +
                                  '<block type="maze_turn">' +
                                    '<title name="DIR">turnRight</title>' +
                                  '</block>' +
                                '</statement>' +
                              '</block>' +
                            '</next>' +
                          '</block>' +
                        '</next>' +
                      '</block>' +
                    '</next>' +
                  '</block>' +
                '</next>' +
              '</block>' +
            '</next>' +
          '</block>' +
        '</statement>' +
      '</block>' +
    '</xml>'
  }]
};
