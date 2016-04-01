var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;
var blockUtils = require('@cdo/apps/block_utils');
var commonMsg = require('@cdo/apps/locale');

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: blockUtils.mathBlockXml('functional_greater_than', {
      ARG1: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 2}),
      ARG2: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 1})
    }, null),
    requiredBlocks: '',
    freePlay: false
  },
  tests: [
    {
      description: "empty answer",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Eval.message,
          commonMsg.emptyTopLevelBlock({topLevelBlockName: 'evaluate'}));
        return true;
      },
      xml: '<xml></xml>'
    },
    {
      description: "empty input",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, commonMsg.emptyFunctionalBlock());
        return true;
      },
      xml: '<xml>' +
        blockUtils.mathBlockXml('functional_greater_than', {
          ARG1: blockUtils.mathBlockXml('functional_math_number', null, {NUM: 2})
          // missing ARG2
        }, null) +
      '</xml>'
    },
    {
      description: "empty input in variable",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, commonMsg.emptyBlockInVariable({name: 'my-image'}));
        return true;
      },
      xml: '<xml>' +
      '  <block type="functional_definition" inline="false" editable="false">' +
      '    <mutation>' +
      '      <outputtype>Image</outputtype>' +
      '      <isfunctionalvariable>true</isfunctionalvariable>' +
      '    </mutation>' +
      '    <title name="NAME">my-image</title>' +
      '    <functional_input name="STACK">' +
      '      <block type="functional_star" inline="false">' +
                // missing input here
      '        <functional_input name="STYLE">' +
      '          <block type="functional_style">' +
      '            <title name="VAL">outline</title>' +
      '          </block>' +
      '        </functional_input>' +
      '        <functional_input name="COLOR">' +
      '          <block type="functional_string">' +
      '            <title name="VAL">blue</title>' +
      '          </block>' +
      '        </functional_input>' +
      '      </block>' +
      '    </functional_input>' +
      '  </block>' +
      '  <block type="functional_display" inline="false" deletable="false" movable="false">' +
      '    <functional_input name="ARG1">' +
      '      <block type="overlay" inline="false">' +
      '        <functional_input name="TOP">' +
      '          <block type="functional_call">' +
      '            <mutation name="my-image"></mutation>' +
      '          </block>' +
      '        </functional_input>' +
      '        <functional_input name="BOTTOM">' +
      '          <block type="functional_call">' +
      '            <mutation name="my-image"></mutation>' +
      '          </block>' +
      '        </functional_input>' +
      '      </block>' +
      '    </functional_input>' +
      '  </block>' +
      '</xml>'
    },
    {
      description: "empty input in function",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTIONAL_BLOCK
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, commonMsg.emptyBlockInFunction({name: 'red-circle'}));
        return true;
      },
      xml: '<xml>' +
      '  <block type="functional_definition" inline="false" editable="false">' +
      '    <mutation>' +
      '      <arg name="radius" type="Number"></arg>' +
      '      <outputtype>Image</outputtype>' +
      '    </mutation>' +
      '    <title name="NAME">red-circle</title>' +
      '    <functional_input name="STACK">' +
      '      <block type="functional_circle" inline="false">' +
      '        <functional_input name="SIZE">' +
      '          <block type="functional_parameters_get">' +
      '            <mutation>' +
      '              <outputtype>Number</outputtype>' +
      '            </mutation>' +
      '            <title name="VAR">radius</title>' +
      '          </block>' +
      '        </functional_input>' +
      '        <functional_input name="STYLE">' +
              // missing input here
      '        </functional_input>' +
      '        <functional_input name="COLOR">' +
      '          <block type="functional_string">' +
      '            <title name="VAL">rd</title>' +
      '          </block>' +
      '        </functional_input>' +
      '      </block>' +
      '    </functional_input>' +
      '  </block>' +
      '  <block type="functional_example" inline="false">' +
      '    <functional_input name="ACTUAL">' +
      '      <block type="functional_call" inline="false">' +
      '        <mutation name="red-circle">' +
      '          <arg name="radius" type="Number"></arg>' +
      '        </mutation>' +
      '      </block>' +
      '    </functional_input>' +
      '  </block>' +
      '  <block type="functional_example" inline="false">' +
      '    <functional_input name="ACTUAL">' +
      '      <block type="functional_call" inline="false">' +
      '        <mutation name="red-circle">' +
      '          <arg name="radius" type="Number"></arg>' +
      '        </mutation>' +
      '      </block>' +
      '    </functional_input>' +
      '  </block>' +
      '  <block type="functional_display" inline="false" deletable="false" movable="false">' +
      '    <functional_input name="ARG1">' +
      '      <block type="functional_call" inline="false">' +
      '        <mutation name="red-circle">' +
      '          <arg name="radius" type="Number"></arg>' +
      '        </mutation>' +
      '        <functional_input name="ARG0">' +
      '          <block type="functional_math_number">' +
      '            <title name="NUM">12</title>' +
      '          </block>' +
      '        </functional_input>' +
      '      </block>' +
      '    </functional_input>' +
      '  </block>' +
      '</xml>'
    },

    {
      description: "unnamed function",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTION_NAME
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, commonMsg.unnamedFunction());
        return true;
      },
      xml: '<xml>' +
        '<block type="functional_definition" inline="false" editable="false">' +
        '  <mutation>' +
        '    <arg name="size" type="Number"></arg>' +
        '    <description>Produces a  of given size</description>' +
        '    <outputtype>Image</outputtype>' +
        '  </mutation>' +
        '  <title name="NAME"></title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_triangle" inline="false" id="callout_here">' +
        '      <functional_input name="SIZE">' +
        '        <block type="functional_parameters_get">' +
        '          <mutation>' +
        '            <outputtype>Number</outputtype>' +
        '          </mutation>' +
        '          <title name="VAR">size</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="STYLE">' +
        '        <block type="functional_style">' +
        '          <title name="VAL">solid</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="COLOR">' +
        '        <block type="functional_string">' +
        '          <title name="VAL">green</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '<block type="functional_display" inline="false" deletable="false" movable="false">' +
        '  <functional_input name="ARG1">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="">' +
        '        <arg name="size" type="Number"></arg>' +
        '      </mutation>' +
        '      <functional_input name="ARG0">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">200</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
      '</xml>'
    },

    {
      description: "unnamed variable",
      expected: {
        result: false,
        testResult: TestResults.EMPTY_FUNCTION_NAME
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, commonMsg.unnamedFunction());
        return true;
      },
      xml: '<xml>' +
        '<block type="functional_definition" inline="false" editable="false">' +
        '  <mutation>' +
        '    <outputtype>Image</outputtype>' +
        '    <isfunctionalvariable>true</isfunctionalvariable>' +
        '  </mutation>' +
        '  <title name="NAME"></title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_triangle" inline="false">' +
        '      <functional_input name="SIZE">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">10</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="STYLE">' +
        '        <block type="functional_string">' +
        '          <title name="VAL">solid</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="COLOR">' +
        '        <block type="functional_string">' +
        '          <title name="VAL">green</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '<block type="functional_display" inline="false" deletable="false" movable="false">' +
        '  <functional_input name="ARG1">' +
        '    <block type="functional_call">' +
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
        assert.equal(Eval.message, commonMsg.unnamedFunction());
        return true;
      },
      xml: '<xml>' +
        '<block type="functional_definition" inline="false" editable="false">' +
        '  <mutation>' +
        '    <arg name="size" type="Number"></arg>' +
        '    <description>Produce a green triangle of given size</description>' +
        '    <outputtype>Image</outputtype>' +
        '  </mutation>' +
        '  <title name="NAME"></title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_triangle" inline="false">' +
        '      <functional_input name="SIZE">' +
        '        <block type="functional_parameters_get">' +
        '          <mutation>' +
        '            <outputtype>Number</outputtype>' +
        '          </mutation>' +
        '          <title name="VAR">size</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="STYLE">' +
        '        <block type="functional_style">' +
        '          <title name="VAL">solid</title>' +
        '        </block>' +
        '      </functional_input>' +
        '      <functional_input name="COLOR">' +
        '        <block type="functional_string">' +
        '          <title name="VAL">green</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '<block type="functional_display" inline="false" deletable="false" movable="false">' +
        '  <functional_input name="ARG1">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="">' +
        '        <arg name="size" type="Number"></arg>' +
        '      </mutation>' +
        '      <functional_input name="ARG0">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">125</title>' +
        '        </block>' +
        '      </functional_input>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
      '</xml>'
    },
  ]
};
