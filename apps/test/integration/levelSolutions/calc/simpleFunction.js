import {TestResults} from '@cdo/apps/constants';

var level = {
  // f(x) = x
  // f(3)
  solutionBlocks: '<xml>' +
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
    '  <functional_input name="STACK">' +
    '    <block type="functional_parameters_get" uservisible="false">' +
    '      <mutation>' +
    '        <outputtype>Number</outputtype>' +
    '      </mutation>' +
    '      <title name="VAR">x</title>' +
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
        result: true,
        testResult: TestResults.ALL_PASS
      },
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
        '  <functional_input name="STACK">' +
        '    <block type="functional_parameters_get" uservisible="false">' +
        '      <mutation>' +
        '        <outputtype>Number</outputtype>' +
        '      </mutation>' +
        '      <title name="VAR">x</title>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '</xml>',
    },
    {
      description: 'Incorrect evaluation for f(3)',
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
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
        '  <functional_input name="STACK">' +
        '    <block type="functional_math_number">' +
        '      <title name="NUM">2</title>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '</xml>'
    },
    {
      description: 'Correct evaluation for f(3), but not other inputs',
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
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
        '  <functional_input name="STACK">' +
        '    <block type="functional_math_number">' +
        '      <title name="NUM">3</title>' +
        '    </block>' +
        '  </functional_input>' +
        '</block>' +
        '</xml>',
      customValidator: function (assert) {
        // At the point where report gets called, we haven't actually updated
        // our display area. We do our validation asynchronously so that
        // we do update our display area before this gets called
        setTimeout(function () {
          var userExpression = document.getElementById('userExpression');
          assert(userExpression.childNodes.length === 3);
          var failedInputGroup = userExpression.childNodes[2];
          assert(failedInputGroup.childNodes.length === 6);
          var equalSign = failedInputGroup.childNodes[4];
          assert(equalSign.className.baseVal === '', 'actual: ' + equalSign.className);
          assert(equalSign.textContent === "\u00A0\u00A0=\u00A0\u00A0", 'actual: ' + equalSign.textContent.replace(/ /g, "_"));
          var failureText = failedInputGroup.childNodes[5];
          assert(failureText.className.baseVal === 'errorToken');
          assert(failureText.textContent === "3");
        }, 0);

        return true;
      }
    },
    {
      description: 'Question marks in answer',
      expected: {
        result: false,
        testResult: TestResults.QUESTION_MARKS_IN_NUMBER_FIELD
      },
      // same as correct answer, but with a ???
      xml: '<xml>' +
        '  <block type="functional_compute" inline="false" deletable="false" movable="false">' +
        '  <functional_input name="ARG1">' +
        '    <block type="functional_call" inline="false">' +
        '      <mutation name="f">' +
        '        <arg name="x" type="Number"/>' +
        '      </mutation>' +
        '      <functional_input name="ARG0">' +
        '        <block type="functional_math_number">' +
        '          <title name="NUM">???</title>' +
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
        '</xml>',
    }
  ]
};
