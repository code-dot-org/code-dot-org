var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

describe("JSInterpreter", function () {
  var Observer = require('@cdo/apps/Observer');
  var JSInterpreter = require('@cdo/apps/JSInterpreter');
  var jsInterpreter;

  // Setup up window.Interpreter.
  window.acorn = require('../lib/jsinterpreter/acorn');
  require('../lib/jsinterpreter/interpreter');

  function initWithCode(code) {
    // Setup a jsInterpreter instance with `hideSource: true` so an editor isn't
    // needed.
    jsInterpreter = new JSInterpreter({
      shouldRunAtMaxSpeed: function() { return false; },
      studioApp: {hideSource: true}
    });

    // Initialize a test program
    jsInterpreter.calculateCodeInfo(code);
    jsInterpreter.parse({code: code});

    assert(jsInterpreter.initialized());

    // Step in
    jsInterpreter.paused = true;
    jsInterpreter.nextStep = JSInterpreter.StepType.IN;
    jsInterpreter.executeInterpreter(true);
  }

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
    initWithCode('for (var i = 0; i < 2; i++) { 1; }');
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

  it("steps a `switch` statement", function () {
    initWithCode('switch (5) { case 5: 1; } 2;');
    assertCurrentState({node: {type: 'SwitchStatement'}});

    // Continue stepping
    verifyStepSequence([
      {node: {type: 'SwitchStatement'}},
      {node: {type: 'ExpressionStatement', expression: {value: 1}}},
      {node: {type: 'ExpressionStatement', expression: {value: 2}}}
    ]);
  });

  it("hits a breakpoint", function () {
    initWithCode('0;\n1;\n2;\n3;\n4;\n5;\n6;\n7;');
    jsInterpreter.isBreakpointRow = function (row) {
      return row === 3 || row == 5;
    };

    var observer = new Observer(), hitBreakpoint = false, MAX_STEPS = 100, i;
    observer.observe(jsInterpreter.onPause, function () {
      hitBreakpoint = true;
    });

    jsInterpreter.paused = false;

    for (i = 0; !hitBreakpoint && i < MAX_STEPS; i++) {
      jsInterpreter.executeInterpreter();
    }
    hitBreakpoint = false;
    assertCurrentState({node: {type: 'ExpressionStatement', expression: {value: 3}}});

    for (i = 0; !hitBreakpoint && i < MAX_STEPS; i++) {
      jsInterpreter.executeInterpreter();
    }
    hitBreakpoint = false;
    assertCurrentState({node: {type: 'ExpressionStatement', expression: {value: 5}}});
  });

});
