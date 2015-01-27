var testUtils = require('../../util/testUtils');
var ResultType = require(testUtils.buildPath('constants.js')).ResultType;
var TestResults = require(testUtils.buildPath('constants.js')).TestResults;
var blockUtils = require(testUtils.buildPath('block_utils'));

var level = {
  // f(x, y) = x + y
  // f(1,2)
  solutionBlocks: '<xml>' +
    '<block type="functional_compute" inline="false" deletable="false" movable="false">' +
    '  <functional_input name="ARG1">' +
    '    <block type="functional_call" inline="false">' +
    '      <mutation name="f">' +
    '        <arg name="x" type="Number"/>' +
    '        <arg name="y" type="Number"/>' +
    '      </mutation>' +
    '      <functional_input name="ARG0">' +
    '        <block type="functional_math_number">' +
    '          <title name="NUM">1</title>' +
    '        </block>' +
    '      </functional_input>' +
    '      <functional_input name="ARG1">' +
    '        <block type="functional_math_number">' +
    '          <title name="NUM">2</title>' +
    '        </block>' +
    '      </functional_input>' +
    '    </block>' +
    '  </functional_input>' +
    '</block>' +
    '<block type="functional_definition" inline="false" uservisible="false">' +
    '  <mutation>' +
    '    <arg name="x" type="Number"/>' +
    '    <arg name="y" type="Number"/>' +
    '    <outputtype>Number</outputtype>' +
    '  </mutation>' +
    '  <title name="NAME">f</title>' +
    '  <functional_input name="STACK">' +
    '    <block type="functional_plus" inline="false" uservisible="false">' +
    '      <functional_input name="ARG1">' +
    '        <block type="functional_parameters_get" uservisible="false">' +
    '          <mutation>' +
    '            <outputtype>Number</outputtype>' +
    '          </mutation>' +
    '          <title name="VAR">x</title>' +
    '        </block>' +
    '      </functional_input>' +
    '      <functional_input name="ARG2">' +
    '        <block type="functional_parameters_get" uservisible="false">' +
    '          <mutation>' +
    '            <outputtype>Number</outputtype>' +
    '          </mutation>' +
    '          <title name="VAR">y</title>' +
    '        </block>' +
    '      </functional_input>' +
    '    </block>' +
    '  </functional_input>' +
    '</block>' +
    '</xml>',
  ideal: Infinity,
  freePlay: false,
};

module.exports = {
  app: "calc",
  skinId: 'calc',
  levelDefinition: level,
  tests: [
    {
      description: "Correct answer",
      expected: {
        result: ResultType.SUCCESS,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        '<block type="functional_compute" inline="false" deletable="false" movable="false">' +
        '  <functional_input name="ARG1">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="f">' +
        '        <arg name="x" type="Number"/>' +
        '        <arg name="y" type="Number"/>' +
        '      </mutation>' +
        '      <functional_input name="ARG0">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">1</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="ARG1">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">2</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '<block type="functional_definition" inline="false" uservisible="false">' +
        '  <mutation>' +
        '    <arg name="x" type="Number"/>' +
        '    <arg name="y" type="Number"/>' +
        '    <outputtype>Number</outputtype>' +
        '  </mutation>' +
        '  <title name="NAME">f</title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_plus" inline="false" uservisible="false">' +
        '      <functional_input name="ARG1">' +
        '        <block type="functional_parameters_get" uservisible="false">' +
        '          <mutation>' +
        '            <outputtype>Number</outputtype>' +
        '          </mutation>' +
        '          <title name="VAR">x</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="ARG2">' +
        '        <block type="functional_parameters_get" uservisible="false">' +
        '          <mutation>' +
        '            <outputtype>Number</outputtype>' +
        '          </mutation>' +
        '          <title name="VAR">y</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
      '</xml>',
    }
  ]
};
