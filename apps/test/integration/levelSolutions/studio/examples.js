import {TestResults} from '@cdo/apps/constants';

var solutionBlocks = '' +
  '<block type="functional_definition" inline="false" deletable="false" movable="false" editable="false">' +
  '  <mutation>' +
  '    <arg name="x" type="Number"></arg>' +
  '    <outputtype>Number</outputtype>' +
  '  </mutation>' +
  '  <title name="NAME">f</title>' +
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
  '          <title name="NUM">1</title>' +
  '        </block>' +
  '      </functional_input>' +
  '    </block>' +
  '  </functional_input>' +
  '</block>';

var validExample1 = '' +
  '<block type="functional_example" inline="false">' +
  '  <functional_input name="ACTUAL">' +
  '    <block type="functional_call" inline="false">' +
  '      <mutation name="f">' +
  '        <arg name="x" type="Number"></arg>' +
  '      </mutation>' +
  '      <functional_input name="ARG0">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">1</title>' +
  '        </block>' +
  '      </functional_input>' +
  '    </block>' +
  '  </functional_input>' +
  '  <functional_input name="EXPECTED">' +
  '    <block type="functional_plus" inline="false">' +
  '      <functional_input name="ARG1">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">1</title>' +
  '        </block>' +
  '      </functional_input>' +
  '      <functional_input name="ARG2">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">1</title>' +
  '        </block>' +
  '      </functional_input>' +
  '    </block>' +
  '  </functional_input>' +
  '</block>';

var validExample2 = '' +
  '<block type="functional_example" inline="false">' +
  '  <functional_input name="ACTUAL">' +
  '    <block type="functional_call" inline="false">' +
  '      <mutation name="f">' +
  '        <arg name="x" type="Number"></arg>' +
  '      </mutation>' +
  '      <functional_input name="ARG0">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">2</title>' +
  '        </block>' +
  '      </functional_input>' +
  '    </block>' +
  '  </functional_input>' +
  '  <functional_input name="EXPECTED">' +
  '    <block type="functional_plus" inline="false">' +
  '      <functional_input name="ARG1">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">2</title>' +
  '        </block>' +
  '      </functional_input>' +
  '      <functional_input name="ARG2">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">1</title>' +
  '        </block>' +
  '      </functional_input>' +
  '    </block>' +
  '  </functional_input>' +
  '</block>';

var invalidExample1 = '' +
  '<block type="functional_example" inline="false">' +
  '  <functional_input name="ACTUAL">' +
  '    <block type="functional_call" inline="false">' +
  '      <mutation name="f">' +
  '        <arg name="x" type="Number"></arg>' +
  '      </mutation>' +
  '      <functional_input name="ARG0">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">1</title>' +
  '        </block>' +
  '      </functional_input>' +
  '    </block>' +
  '  </functional_input>' +
  '  <functional_input name="EXPECTED">' +
  '    <block type="functional_plus" inline="false">' +
  '      <functional_input name="ARG1">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">1</title>' +
  '        </block>' +
  '      </functional_input>' +
  '      <functional_input name="ARG2">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">20</title>' +
  '        </block>' +
  '      </functional_input>' +
  '    </block>' +
  '  </functional_input>' +
  '</block>';

var invalidExampleMissingResult = '' +
  '<block type="functional_example" inline="false">' +
  '  <functional_input name="ACTUAL">' +
  '    <block type="functional_call" inline="false">' +
  '      <mutation name="f">' +
  '        <arg name="x" type="Number"></arg>' +
  '      </mutation>' +
  '      <functional_input name="ARG0">' +
  '        <block type="functional_math_number">' +
  '          <title name="NUM">1</title>' +
  '        </block>' +
  '      </functional_input>' +
  '    </block>' +
  '  </functional_input>' +
  '</block>';

module.exports = {
  app: 'studio',
  skinId: 'studio',
  levelDefinition: {
    solutionBlocks: solutionBlocks,
    map: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 16,0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    useContractEditor: true,
    examplesRequired: true,
    requiredBlocks: '',
    freePlay: false,
    goal: {
      successCondition: function () {
        return Studio.tickCount > 2;
      }
    }
  },
  // Note: Thought the solution blocks are slightly different (Studio doesn't
  // have a compute block) and the success condition is added,  these tests are
  // otherwise identical to calc/examples.js
  tests: [
    {
      description: "example is missing result block",
      expected: {
        result: false,
        testResult: TestResults.EXAMPLE_FAILED
      },
      customValidator: function (assert) {
        assert.equal(Studio.message, 'You need at least two examples in' +
            ' function f. Make sure each example has a call and a result.');
        return true;
      },
      xml: '<xml>' +
        solutionBlocks +
        invalidExampleMissingResult +
        validExample2 +
        '</xml>'
    },
    {
      description: "example result doesnt match definition",
      expected: {
        result: false,
        testResult: TestResults.EXAMPLE_FAILED
      },
      customValidator: function (assert) {
        assert.equal(Studio.message, 'The function f has' +
          ' one or more examples that need adjusting. Make sure they match your' +
          ' definition and answer the question.');
        return true;
      },
      xml: '<xml>' +
        solutionBlocks +
        invalidExample1 +
        validExample2 +
        '</xml>'
    },
    {
      description: "example result does match definition",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function (assert) {
        assert.equal(Studio.message, null);
        return true;
      },
      xml: '<xml>' +
        solutionBlocks +
        validExample1 +
        validExample2 +
        '</xml>'
    },
    {
      description: "variables don't need examples",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      customValidator: function (assert) {
        assert.equal(Studio.message, null);
        return true;
      },
      xml: '<xml>' +
        solutionBlocks +
        validExample1 +
        validExample2 +
        // We add a variable definition without examples. Things should still pass
        '<block type="functional_definition" inline="false">' +
        '  <mutation>' +
        '    <outputtype>Number</outputtype>' +
        '    <isfunctionalvariable>true</isfunctionalvariable>' +
        '  </mutation>' +
        '  <title name="NAME">age</title>' +
        '  <functional_input name="STACK">' +
        '    <block type="functional_math_number">' +
        '      <title name="NUM">12</title>' +
        '    </block>' +
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
        assert.equal(Studio.message, 'You need at least two' +
        ' examples in function f. Make sure each example has a call and a' +
            ' result.');
        return true;
      },
      xml: '<xml>' +
        solutionBlocks +
        '</xml>'
    }

  ]
};
