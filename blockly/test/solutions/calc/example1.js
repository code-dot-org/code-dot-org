var TestResults = require('../../../src/constants.js').TestResults;
var blockUtils = require('../../../src/block_utils');


var levelDef = {

};

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
      //todo (brent) : make block utils
      xml: '<xml>' +
        '  <block type="functional_times" inline="false">' +
        '    <functional_input name="ARG1">' +
        '      <block type="functional_plus" inline="false">' +
        '        <functional_input name="ARG1">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">1</title>' +
        '          </block>' +
        '        </functional_input>' +
        '        <functional_input name="ARG2">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">2</title>' +
        '          </block>' +
        '        </functional_input>' +
        '      </block>' +
        '    </functional_input>' +
        '    <functional_input name="ARG2">' +
        '      <block type="functional_plus" inline="false">' +
        '        <functional_input name="ARG1">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">3</title>' +
        '          </block>' +
        '        </functional_input>' +
        '        <functional_input name="ARG2">' +
        '          <block type="functional_math_number">' +
        '            <title name="NUM">4</title>' +
        '          </block>' +
        '        </functional_input>' +
        '      </block>' +
        '    </functional_input>' +
        '  </block>' +
        '</xml>'
    }
  ]
};
