import {TestResults} from '@cdo/apps/constants';


module.exports = {
  app: "turtle",
  levelFile: "levels",
  levelId: "3_6",
  tests: [
    {
      description: "Expected solution",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      missingBlocks: [],
      xml: '<xml><block type="when_run"><next><block type="procedures_callnoreturn" inline="false"><mutation name="draw a triangle"><arg name="length"></arg></mutation><value name="ARG0"><block type="math_number"><title name="NUM">100</title></block></value><next><block type="draw_move" inline="true"><title name="DIR">moveForward</title><value name="VALUE"><block type="math_number"><title name="NUM">100</title></block></value><next><block type="procedures_callnoreturn" inline="false"><mutation name="draw a triangle"><arg name="length"></arg></mutation><value name="ARG0"><block type="math_number"><title name="NUM">200</title></block></value></block></next></block></next></block></next></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation><arg name="length"></arg></mutation><title name="NAME">draw a square</title><statement name="STACK"><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="draw_move" inline="true" deletable="false" editable="false"><title name="DIR">moveForward</title><value name="VALUE"><block type="variables_get_length" deletable="false" editable="false"></block></value><next><block type="draw_turn" inline="true" deletable="false" editable="false"><title name="DIR">turnRight</title><value name="VALUE"><block type="math_number" deletable="false" editable="false"><title name="NUM">90</title></block></value></block></next></block></statement></block></statement></block><block type="procedures_defnoreturn"><mutation><arg name="length"></arg></mutation><title name="NAME">draw a triangle</title><statement name="STACK"><block type="controls_repeat"><title name="TIMES">3</title><statement name="DO"><block type="draw_move" inline="true"><title name="DIR">moveForward</title><value name="VALUE"><block type="variables_get_length"></block></value><next><block type="draw_turn" inline="true"><title name="DIR">turnRight</title><value name="VALUE"><block type="math_number"><title name="NUM">120</title></block></value></block></next></block></statement></block></statement></block></xml>'
    }
    // todo - add failure case(s)
  ]
};
