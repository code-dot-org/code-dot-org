var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

describe("JSInterpreter", function () {
  var JSInterpreter = require('@cdo/apps/JSInterpreter');
  var jsInterpreter;

  // Setup up window.Interpreter.
  window.acorn = require('../lib/jsinterpreter/acorn');
  require('../lib/jsinterpreter/interpreter');

  function assertCurrentState(expected) {
    var state = jsInterpreter.interpreter.stateStack[0];
    assert.containSubset(state, expected);
  }

  function stepAndVerify(expected) {
    jsInterpreter.nextStep = JSInterpreter.StepType.IN;
    jsInterpreter.executeInterpreter();
    assertCurrentState(expected);
  }

  function verifyStepSequence(expectedStates) {
    expectedStates.forEach(function (expected) {
      stepAndVerify(expected);
    });
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

    assertCurrentState({node: {type: 'ForStatement'}, mode: undefined});

    // Continue stepping
    verifyStepSequence([
      {node: {type: 'ForStatement'}, mode: 1}, // (test) i < 2;
      {node: {type: 'ExpressionStatement'}},   // (body) 1;
      {node: {type: 'ForStatement'}, mode: 3}, // (update) i++
      {node: {type: 'ForStatement'}, mode: 1}, // (test) i < 2;
      {node: {type: 'ExpressionStatement'}},   // (body) 1;
      {node: {type: 'ForStatement'}, mode: 3}, // (update) i++
      {node: {type: 'ForStatement'}, mode: 1}  // (test) i < 2;
    ]);
  });

});
