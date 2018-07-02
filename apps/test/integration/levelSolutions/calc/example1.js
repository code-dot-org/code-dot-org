import {TestResults} from '@cdo/apps/constants';
var blockUtils = require('@cdo/apps/block_utils');
var calcMsg = require('@cdo/apps/calc/locale');
var commonMsg = require('@cdo/locale');

module.exports = {
  app: "calc",
  skinId: 'calc',
  levelFile: "levels",
  levelId: 'example1',
  tests: [
    {
      description: "Correct answer",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          blockUtils.calcBlockXml('functional_plus', [3, 4])
        ]) +
      '</xml>'
    },
    {
      description: "mirrored answer",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [4, 3]),
          blockUtils.calcBlockXml('functional_plus', [2, 1])
        ]) +
      '</xml>'
    },
    {
      description: "wrong answer",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          blockUtils.calcBlockXml('functional_plus', [3, 3])
        ]) +
      '</xml>'
    },
    {
      description: "empty answer",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message,
          commonMsg.emptyTopLevelBlock({topLevelBlockName: 'evaluate'}));
        return true;
      },
      xml: '<xml></xml>'
    },
    {
      description: 'empty input',
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, commonMsg.emptyFunctionalBlock());
        return true;
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          blockUtils.calcBlockXml('functional_plus', [3]) // missing second input
        ]) +
      '</xml>'
    },
    {
      description: 'empty input inside a variable',
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, commonMsg.emptyBlockInVariable({name: 'age'}));
        return true;
      },
      xml: '<xml>' +
        '<block type="functional_definition" inline="false" editable="false">' +
          '<mutation>' +
            '<outputtype>Number</outputtype>' +
            '<isfunctionalvariable>true</isfunctionalvariable>' +
          '</mutation>' +
          '<title name="NAME">age</title>' +
          // missing input here
        '</block>' +
        '<block type="functional_compute" inline="false" deletable="false" movable="false">' +
          '<functional_input name="ARG1">' +
            '<block type="functional_call" movable="false" id="callout_here">' +
              '<mutation name="age"></mutation>' +
            '</block>' +
          '</functional_input>' +
        '</block>' +
      '</xml>'
    },
    {
      description: 'empty input inside a function',
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, commonMsg.emptyBlockInFunction({name: 'f'}));
        return true;
      },
      // f(x) = __
      // f(3)
      xml: '<xml>' +
        '  <block type="functional_compute" inline="false" deletable="false" movable="false">' +
        '  <functional_input name="ARG1">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="f">' +
        '        <arg name="x" type="Number"/>' +
        '      </mutation>' +
        '      <functional_input name="ARG0">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">3</title>' +
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
        // missing block here
        '</block>' +
        '</xml>',
    },
    {
      description: 'extra top block',
      expected: {
        result: true,
        testResult: TestResults.PASS_WITH_EXTRA_TOP_BLOCKS
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_times', [
          blockUtils.calcBlockXml('functional_plus', [1, 2]),
          blockUtils.calcBlockXml('functional_plus', [3, 4])
        ]) +
        blockUtils.calcBlockXml('functional_plus', [1, 2]) +
      '</xml>'
    },
    {
      description: "divide by zero",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, calcMsg.divideByZeroError());
        return true;
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_dividedby', [4, 0]) +
      '</xml>'
    },
    {
      description: "imaginary number",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, calcMsg.imaginaryNumberError());
        return true;
      },
      xml: '<xml>' +
        blockUtils.calcBlockXml('functional_sqrt', [-1]) +
      '</xml>'
    },
    {
      description: "unnamed variable",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTION_NAME
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, commonMsg.unnamedFunction());
        return true;
      },
      xml: '<xml>' +
        '<block type="functional_definition" inline="false" editable="false">' +
        '  <mutation>' +
        '    <outputtype>Number</outputtype>' +
        '    <isfunctionalvariable>true</isfunctionalvariable>' +
        '  </mutation>' +
        '  <title name="NAME"></title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_math_number">' +
        '      <title name="NUM">12</title>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '<block type="functional_compute" inline="false" deletable="false" movable="false">' +
        '  <functional_input name="ARG1">' +
        '    <block type="functional_call" movable="false" id="callout_here">' +
        '      <mutation name=""></mutation>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
      '</xml>'
    },

    {
      description: "unnamed function",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTION_NAME
      },
      customValidator: function (assert) {
        assert.equal(Calc.__testonly__.appState.message, commonMsg.unnamedFunction());
        return true;
      },
      xml: '<xml>' +
        '<block type="functional_definition" inline="false" editable="false">' +
        '  <mutation>' +
        '    <arg name="x" type="Number"></arg>' +
        '    <outputtype>Number</outputtype>' +
        '  </mutation>' +
        '  <title name="NAME"></title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_plus" inline="false">' +
        '      <functional_input name="ARG1">' +
        '        <block type="functional_parameters_get">' +
        '          <mutation>' +
        '            <outputtype>Number</outputtype>' +
        '          </mutation>' +
        '          <title name="VAR">x</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="ARG2">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">2</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '<block type="functional_compute" inline="false" deletable="false" movable="false">' +
        '  <functional_input name="ARG1">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="">' +
        '        <arg name="x" type="Number"></arg>' +
        '      </mutation>' +
        '      <functional_input name="ARG0">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">15</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
      '</xml>'
    }
  ]
};
