var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

describe("JSInterpreter", function () {
  var JSInterpreter = require('@cdo/apps/JSInterpreter');
  var jsInterpreter;

  // Setup up window.Interpreter.
  window.acorn = require('../lib/jsinterpreter/acorn');
  require('../lib/jsinterpreter/interpreter');

  function assertCurrentNode(expected) {
    var node = jsInterpreter.interpreter.stateStack[0].node;
    Object.keys(expected).forEach(function (key) {
      assert.equal(node[key], expected[key], node.type + ' -> ' + key);
    });
  }

  function stepAndVerify(expected) {
    jsInterpreter.nextStep = JSInterpreter.StepType.IN;
    jsInterpreter.executeInterpreter();
    assertCurrentNode(expected);
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

    assertCurrentNode({type: 'ForStatement', mode: undefined});

    // Continue stepping
    stepAndVerify({type: 'ForStatement', mode: 1}); // (test) i < 2
    stepAndVerify({type: 'ExpressionStatement'});   // (body) 1;
    stepAndVerify({type: 'ForStatement', mode: 3}); // (update) i++
    stepAndVerify({type: 'ForStatement', mode: 1}); // (test) i < 2
    stepAndVerify({type: 'ExpressionStatement'});   // (body) 1;
    stepAndVerify({type: 'ForStatement', mode: 3}); // (update) i++
    stepAndVerify({type: 'ForStatement', mode: 1}); // (test) i < 2
  });

});
