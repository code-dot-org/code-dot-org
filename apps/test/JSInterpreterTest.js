var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

describe("JSInterpreter", function () {
  var JSInterpreter = require('@cdo/apps/JSInterpreter');
  var jsInterpreter;

  // Setup up window.Interpreter.
  window.acorn = require('../lib/jsinterpreter/acorn');
  require('../lib/jsinterpreter/interpreter');

  function assertCurrentNode(nodeType) {
    assert.equal(jsInterpreter.interpreter.stateStack[0].node.type, nodeType);
  }

  it("steps a `for` loop", function () {

    // Setup a jsInterpreter instance with `hideSource: true` so an editor isn't
    // needed. Mock `getUserCodeLine` so the code is considered inUserCode.
    jsInterpreter = new JSInterpreter({
      studioApp: {hideSource: true}
    });
    jsInterpreter.getUserCodeLine = function () { return 0; };

    // Initialize a test program
    jsInterpreter.parse({
      code: 'for (var i = 0; i < 2; i++) { 1; }'
    });

    assert(jsInterpreter.initialized());

    // Step in
    jsInterpreter.paused = true;
    jsInterpreter.nextStep = JSInterpreter.StepType.IN;
    jsInterpreter.executeInterpreter(true);

    assertCurrentNode('ForStatement');
  });

});
