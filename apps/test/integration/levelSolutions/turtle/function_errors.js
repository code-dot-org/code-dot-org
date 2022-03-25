import {TestResults} from '@cdo/apps/constants';

var levelDef = {
  solutionBlocks:
    '<xml><block type="when_run" deletable="false" movable="false"><next><block type="controls_for_counter" inline="true"><mutation counter="counter"></mutation><value name="FROM"><block type="math_number"><field name="NUM">25</field></block></value><value name="TO"><block type="math_number"><field name="NUM">200</field></block></value><value name="BY"><block type="math_number"><field name="NUM">25</field></block></value><statement name="DO"><block type="controls_repeat_ext" inline="true"><value name="TIMES"><block type="math_number"><field name="NUM">3</field></block></value><statement name="DO"><block type="draw_move" inline="true"><field name="DIR">moveForward</field><value name="VALUE"><block type="variables_get"><field name="VAR">counter</field></block></value><next><block type="draw_turn" inline="true"><field name="DIR">turnRight</field><value name="VALUE"><block type="math_number"><field name="NUM">120</field></block></value></block></next></block></statement></block></statement></block></next></block></xml>',
  ideal: Infinity,
  toolbox: null,
  levelBuilderRequiredBlocks:
    '<xml><block type="procedures_defnoreturn" uservisible="false"><mutation><arg name="side length"></arg></mutation><field name="NAME">draw a triangle</field><statement name="STACK"><block type="controls_repeat_ext" inline="true" uservisible="false"><value name="TIMES"><block type="math_number" uservisible="false"><field name="NUM">3</field></block></value><statement name="DO"><block type="draw_move" inline="true" uservisible="false"><field name="DIR">moveForward</field><value name="VALUE"><block type="parameters_get" uservisible="false"><field name="VAR">side length</field></block></value><next><block type="draw_turn" inline="true" uservisible="false"><field name="DIR">turnRight</field><value name="VALUE"><block type="math_number" uservisible="false"><field name="NUM">120</field></block></value></block></next></block></statement></block></statement></block><block type="draw_colour" inline="true"><value name="COLOUR"><block type="colour_picker"><field name="COLOUR">#ff0000</field></block></value></block></xml>',
  freePlay: false,
  useModalFunctionEditor: true
};

module.exports = {
  app: 'turtle',
  levelDefinition: levelDef,
  tests: [
    {
      description: 'Incomplete block inside function',
      expected: {
        result: false,
        testResult: TestResults.INCOMPLETE_BLOCK_IN_FUNCTION
      },
      xml:
        '<xml><block type="procedures_defnoreturn" uservisible="false"><mutation></mutation><field name="NAME">draw a triangle</field><statement name="STACK"><block type="controls_repeat_ext" inline="true" uservisible="false"><value name="TIMES"><block type="math_number" uservisible="false"><field name="NUM">3</field></block></value><statement name="DO"><block type="draw_move" inline="true" uservisible="false"><field name="DIR">moveForward</field><next><block type="draw_turn" inline="true" uservisible="false"><field name="DIR">turnRight</field><value name="VALUE"><block type="math_number" uservisible="false"><field name="NUM">120</field></block></value></block></next></block></statement></block></statement></block><block type="when_run" deletable="false" movable="false"><next><block type="controls_for_counter" inline="true"><mutation counter="counter"></mutation><value name="FROM"><block type="math_number"><field name="NUM">25</field></block></value><value name="TO"><block type="math_number"><field name="NUM">200</field></block></value><value name="BY"><block type="math_number"><field name="NUM">25</field></block></value><statement name="DO"><block type="procedures_callnoreturn"><mutation name="draw a triangle"></mutation></block></statement></block></next></block></xml>'
    },
    {
      description: 'Unused parameter',
      expected: {
        result: false,
        testResult: TestResults.UNUSED_PARAM
      },
      xml:
        '<xml><block type="procedures_defnoreturn" uservisible="false"><mutation><arg name="length"></arg></mutation><field name="NAME">draw a triangle</field><statement name="STACK"><block type="controls_repeat_ext" inline="true" uservisible="false"><value name="TIMES"><block type="math_number" uservisible="false"><field name="NUM">3</field></block></value><statement name="DO"><block type="draw_move" inline="true" uservisible="false"><field name="DIR">moveForward</field><value name="VALUE"><block type="math_number" uservisible="false"><field name="NUM">100</field></block></value><next><block type="draw_turn" inline="true" uservisible="false"><field name="DIR">turnRight</field><value name="VALUE"><block type="math_number" uservisible="false"><field name="NUM">120</field></block></value></block></next></block></statement></block></statement></block><block type="when_run" deletable="false" movable="false"><next><block type="controls_for_counter" inline="true"><mutation counter="counter"></mutation><value name="FROM"><block type="math_number"><field name="NUM">25</field></block></value><value name="TO"><block type="math_number"><field name="NUM">200</field></block></value><value name="BY"><block type="math_number"><field name="NUM">25</field></block></value><statement name="DO"><block type="procedures_callnoreturn" inline="false"><mutation name="draw a triangle"><arg name="length"></arg></mutation></block></statement></block></next></block></xml>'
    },
    {
      description: 'Function called with wrong number of parameters',
      expected: {
        result: false,
        testResult: TestResults.PARAM_INPUT_UNATTACHED
      },
      xml:
        '<xml><block type="procedures_defnoreturn" uservisible="false"><mutation><arg name="length"></arg></mutation><field name="NAME">draw a triangle</field><statement name="STACK"><block type="controls_repeat_ext" inline="true" uservisible="false"><value name="TIMES"><block type="math_number" uservisible="false"><field name="NUM">3</field></block></value><statement name="DO"><block type="draw_move" inline="true" uservisible="false"><field name="DIR">moveForward</field><value name="VALUE"><block type="parameters_get" uservisible="false"><field name="VAR">length</field></block></value><next><block type="draw_turn" inline="true" uservisible="false"><field name="DIR">turnRight</field><value name="VALUE"><block type="math_number" uservisible="false"><field name="NUM">120</field></block></value></block></next></block></statement></block></statement></block><block type="when_run" deletable="false" movable="false"><next><block type="controls_for_counter" inline="true"><mutation counter="counter"></mutation><value name="FROM"><block type="math_number"><field name="NUM">25</field></block></value><value name="TO"><block type="math_number"><field name="NUM">200</field></block></value><value name="BY"><block type="math_number"><field name="NUM">25</field></block></value><statement name="DO"><block type="procedures_callnoreturn" inline="false"><mutation name="draw a triangle"><arg name="length"></arg></mutation></block></statement></block></next></block></xml>'
    },
    {
      description: 'Extra function declared but not used',
      expected: {
        result: true,
        testResult: TestResults.UNUSED_FUNCTION
      },
      xml:
        '<xml><block type="procedures_defnoreturn" uservisible="false"><mutation><arg name="length"></arg></mutation><field name="NAME">draw a triangle</field><statement name="STACK"><block type="controls_repeat_ext" inline="true" uservisible="false"><value name="TIMES"><block type="math_number" uservisible="false"><field name="NUM">3</field></block></value><statement name="DO"><block type="draw_move" inline="true" uservisible="false"><field name="DIR">moveForward</field><value name="VALUE"><block type="parameters_get" uservisible="false"><field name="VAR">length</field></block></value><next><block type="draw_turn" inline="true" uservisible="false"><field name="DIR">turnRight</field><value name="VALUE"><block type="math_number" uservisible="false"><field name="NUM">120</field></block></value></block></next></block></statement></block></statement></block><block type="procedures_defnoreturn" uservisible="false" usercreated="true"><mutation></mutation><field name="NAME">do something</field><statement name="STACK"><block type="draw_move" inline="true" uservisible="false"><field name="DIR">moveForward</field><value name="VALUE"><block type="math_number" uservisible="false"><field name="NUM">100</field></block></value></block></statement></block><block type="when_run" deletable="false" movable="false"><next><block type="controls_for_counter" inline="true"><mutation counter="counter"></mutation><value name="FROM"><block type="math_number"><field name="NUM">25</field></block></value><value name="TO"><block type="math_number"><field name="NUM">200</field></block></value><value name="BY"><block type="math_number"><field name="NUM">25</field></block></value><statement name="DO"><block type="procedures_callnoreturn" inline="false"><mutation name="draw a triangle"><arg name="length"></arg></mutation><value name="ARG0"><block type="variables_get"><field name="VAR">counter</field></block></value></block></statement></block></next></block></xml>'
    }
  ]
};
