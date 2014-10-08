var TestResults = require('../../../src/constants.js').TestResults;
var blockUtils = require('../../../src/block_utils');

// todo (brent) - move to block utils?
function calcBlock(type, args) {
  var str = '<block type="' + type + '" inline="false">'
  for (var i = 1; i <= args.length; i++) {
    str += '<functional_input name="ARG' + i + '">'
    var arg = args[i - 1];
    if (typeof(arg) === "number") {
      arg = calcNumberBlockXml(arg);
    }
    str += arg;
    str += '</functional_input>';
  }
  str+= '</block>';

  return str;
}

function calcNumberBlockXml(num) {
  return '<block type="functional_math_number"><title name="NUM">' + num +'</title></block>';
}

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
        calcBlock('functional_times', [
          calcBlock('functional_plus', [1, 2]),
          calcBlock('functional_plus', [3, 4])
        ]) +
      '</xml>'
    },
    {
      description: "mirrored answer",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
        calcBlock('functional_times', [
          calcBlock('functional_plus', [4, 3]),
          calcBlock('functional_plus', [2, 1])
        ]) +
      '</xml>'
    },
    {
      description: "wrong answer",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      xml: '<xml>' +
        calcBlock('functional_times', [
          calcBlock('functional_plus', [1, 2]),
          calcBlock('functional_plus', [3, 3])
        ]) +
      '</xml>'
    }
  ]
};
