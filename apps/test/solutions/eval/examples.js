var testUtils = require('../../util/testUtils');
var TestResults = require('@cdo/apps/constants.js').TestResults;

var solutionBlocks = '' +
  '<block type="functional_definition" inline="false" movable="false">' +
  '  <mutation>' +
  '    <arg name="size" type="Number" />' +
  '    <description>Produce a green triangle of given size</description>' +
  '    <outputtype>Image</outputtype>' +
  '  </mutation>' +
  '  <title name="NAME">green-triangle</title>' +
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
  '      <mutation name="green-triangle">' +
  '        <arg name="size" type="Number" />' +
  '      </mutation>' +
  '      <functional_input name="ARG0">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">125</title>' +
  '        </block>' +
  '      </functional_input>' +
  '    </block>' +
  '  </functional_input>' +
  '</block>';

module.exports = {
  app: "eval",
  skinId: 'eval',
  levelDefinition: {
    solutionBlocks: solutionBlocks,
    useContractEditor: true,
    examplesRequired: true,
    requiredBlocks: '',
    freePlay: false
  },
  tests: [
    {
      description: "example is missing result block",
      expected: {
        result: false,
        testResult: TestResults.EXAMPLE_FAILED
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, 'You need at least one example in function ' +
          'green-triangle. Make sure each example has a call and a result.');
        return true;
      },
      xml: '<xml>' +
        solutionBlocks +
        '<block type="functional_example" inline="false">' +
        '  <functional_input name="ACTUAL">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="green-triangle">' +
        '        <arg name="size" type="Number"></arg>' +
        '      </mutation>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '</xml>'
    },
    {
      description: "example result doesnt match definition",
      expected: {
        result: false,
        testResult: TestResults.EXAMPLE_FAILED
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, 'The function green-triangle has one or more' +
          ' examples that need adjusting. Make sure they match your definition and' +
          ' answer the question.');
        return true;
      },
      xml: '<xml>' +
        solutionBlocks +
        '<block type="functional_example" inline="false">' +
        '  <functional_input name="ACTUAL">' +
        '      <block type="functional_call" inline="false">' +
        '          <mutation name="green-triangle">' +
        '              <arg name="size" type="Number"></arg>' +
        '          </mutation>' +
        '          <functional_input name="ARG0">' +
        '              <block type="functional_math_number">' +
        '                  <title name="NUM">10</title>' +
        '              </block>' +
        '          </functional_input>' +
        '      </block>' +
        '  </functional_input>' +
        '  <functional_input name="EXPECTED">' +
        '      <block type="functional_triangle" inline="false">' +
        '          <functional_input name="SIZE">' +
        '              <block type="functional_math_number">' +
        '                  <title name="NUM">11</title>' +
        '              </block>' +
        '          </functional_input>' +
        '          <functional_input name="STYLE">' +
        '              <block type="functional_style">' +
        '                  <title name="VAL">solid</title>' +
        '              </block>' +
        '          </functional_input>' +
        '          <functional_input name="COLOR">' +
        '              <block type="functional_string">' +
        '                  <title name="VAL">green</title>' +
        '              </block>' +
        '          </functional_input>' +
        '      </block>' +
        '  </functional_input>' +
        '</block>' +
        '</xml>'
    },

    {
      description: "example result does match definition",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, null);
        return true;
      },
      xml: '<xml>' +
        solutionBlocks +
        '<block type="functional_example" inline="false">' +
        '  <functional_input name="ACTUAL">' +
        '      <block type="functional_call" inline="false">' +
        '          <mutation name="green-triangle">' +
        '              <arg name="size" type="Number"></arg>' +
        '          </mutation>' +
        '          <functional_input name="ARG0">' +
        '              <block type="functional_math_number">' +
        '                  <title name="NUM">11</title>' +
        '              </block>' +
        '          </functional_input>' +
        '      </block>' +
        '  </functional_input>' +
        '  <functional_input name="EXPECTED">' +
        '      <block type="functional_triangle" inline="false">' +
        '          <functional_input name="SIZE">' +
        '              <block type="functional_math_number">' +
        '                  <title name="NUM">11</title>' +
        '              </block>' +
        '          </functional_input>' +
        '          <functional_input name="STYLE">' +
        '              <block type="functional_style">' +
        '                  <title name="VAL">solid</title>' +
        '              </block>' +
        '          </functional_input>' +
        '          <functional_input name="COLOR">' +
        '              <block type="functional_string">' +
        '                  <title name="VAL">green</title>' +
        '              </block>' +
        '          </functional_input>' +
        '      </block>' +
        '  </functional_input>' +
        '</block>' +
        '</xml>'
    },

    {
      description: "no examples when examples required",
      expected: {
        result: false,
        testResult: TestResults.EXAMPLE_FAILED
      },
      customValidator: function (assert) {
        assert.equal(Eval.message, 'You need at least one example in function ' +
        'green-triangle. Make sure each example has a call and a result.');
        return true;
      },
      xml: '<xml>' +
        solutionBlocks +
        '</xml>'
    }
  ]
};
