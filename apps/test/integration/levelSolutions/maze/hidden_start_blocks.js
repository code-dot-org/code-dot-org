import {TestResults} from '@cdo/apps/constants.js';

// Inspired by https://studio.code.org/s/course4/stage/16/puzzle/4
// In this level, we set variables `left` and `right` in a hidden
// "when_run" block that's positioned to be above the user-visible start
// block. The code should therefore run before the user's code, and the
// user can use the variables to make the bee turn left or right.
var levelDef = {
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 2, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  startDirection: 1, // Direction.EAST,
  initialDirt: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  flowerType: 'redWithNectar',
  nectarGoal: 12,
  ideal: 32,
};

module.exports = {
  app: "maze",
  skinId: 'bee',
  levelDefinition: levelDef,
  tests: [{
    description: "Gather nectar using hidden variables",
    expected: {
      result: true,
      testResult: TestResults.ALL_PASS
    },
    xml: '<xml><block type="when_run" deletable="false" movable="false" uservisible="false" y="-5"><next><block type="variables_set" inline="false" uservisible="false"><title name="VAR">left</title><value name="VALUE"><block type="math_number" uservisible="false"><title name="NUM">0</title></block></value><next><block type="variables_set" inline="false" uservisible="false"><title name="VAR">right</title><value name="VALUE"><block type="math_number" uservisible="false"><title name="NUM">1</title></block></value></block></next></block></next></block><block type="when_run" deletable="false" movable="false"><next><block type="controls_repeat"><title name="TIMES">2</title><statement name="DO"><block type="maze_moveForward"><next><block type="procedures_callnoreturn" inline="false"><mutation name="get 3 nectar"><arg name="direction"/></mutation><value name="ARG0"><block type="variables_get"><title name="VAR">left</title></block></value><next><block type="maze_moveForward"><next><block type="procedures_callnoreturn" inline="false"><mutation name="get 3 nectar"><arg name="direction"/></mutation><value name="ARG0"><block type="variables_get"><title name="VAR">right</title></block></value></block></next></block></next></block></next></block></statement></block></next></block><block type="procedures_defnoreturn" uservisible="false"><mutation><arg name="direction"/></mutation><title name="NAME">get 3 nectar</title><statement name="STACK"><block type="controls_if" inline="false" uservisible="false"><mutation else="1"/><value name="IF0"><block type="logic_compare" inline="true" movable="false" uservisible="false"><title name="OP">EQ</title><value name="A"><block type="variables_get" movable="false" uservisible="false"><title name="VAR">direction</title></block></value><value name="B"><block type="variables_get" uservisible="false"><title name="VAR">left</title></block></value></block></value><statement name="DO0"><block type="maze_turn" uservisible="false"><title name="DIR">turnLeft</title></block></statement><statement name="ELSE"><block type="maze_turn" uservisible="false"><title name="DIR">turnRight</title></block></statement><next><block type="maze_move" uservisible="false"><title name="DIR">moveForward</title><next><block type="maze_move" uservisible="false"><title name="DIR">moveForward</title><next><block type="controls_repeat" uservisible="false"><title name="TIMES">3</title><statement name="DO"><block type="maze_nectar" uservisible="false"/></statement><next><block type="maze_move" uservisible="false"><title name="DIR">moveBackward</title><next><block type="maze_move" uservisible="false"><title name="DIR">moveBackward</title><next><block type="controls_if" inline="false" uservisible="false"><mutation else="1"/><value name="IF0"><block type="logic_compare" inline="true" movable="false" uservisible="false"><title name="OP">EQ</title><value name="A"><block type="variables_get" movable="false" uservisible="false"><title name="VAR">direction</title></block></value><value name="B"><block type="variables_get" uservisible="false"><title name="VAR">left</title></block></value></block></value><statement name="DO0"><block type="maze_turn" uservisible="false"><title name="DIR">turnRight</title></block></statement><statement name="ELSE"><block type="maze_turn" uservisible="false"><title name="DIR">turnLeft</title></block></statement></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>'
  }]
};

