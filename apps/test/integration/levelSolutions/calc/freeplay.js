import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');

module.exports = {
  app: "calc",
  skinId: 'calc',
  levelDefinition: {
    solutionBlocks: '',
    requiredBlocks: '',
    freePlay: true
  },
  tests: [
    {
      description: "Simple answer",
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          blockUtils.calcBlockXml('functional_plus', [3, 4])
        ]) +
      '</xml>'
    },
    {
      description: "Answer with a function",
      expected: {
        result: true,
        testResult: TestResults.FREE_PLAY
      },
      xml: '<xml>' +
        '<block type="functional_compute" inline="false" deletable="false" movable="false">' +
        '  <functional_input name="ARG1">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="f">' +
        '        <arg name="x" type="Number"/>' +
        '      </mutation>' +
        '      <functional_input name="ARG0">' +
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
        '    <outputtype>Number</outputtype>' +
        '  </mutation>' +
        '  <title name="NAME">f</title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_parameters_get" uservisible="false">' +
        '      <mutation>' +
        '        <outputtype>Number</outputtype>' +
        '      </mutation>' +
        '      <title name="VAR">x</title>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
      '</xml>'
    },
    {
      description: 'empty answer',
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      xml: '<xml></xml>'
    }
  ]
};
