import {expect, assert} from '../util/configuredChai';
import sinon from 'sinon';
import Interpreter from '@code-dot-org/js-interpreter';

describe("JSInterpreter", function () {
  var Observer = require('@cdo/apps/Observer');
  var JSInterpreter = require('@cdo/apps/JSInterpreter');
  var jsInterpreter;

  function initWithCode(code) {
    // Setup a jsInterpreter instance with `hideSource: true` so an editor isn't
    // needed.
    jsInterpreter = new JSInterpreter({
      shouldRunAtMaxSpeed: function () { return false; },
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

  describe("the constructor", () => {
    beforeEach(() => {
      jsInterpreter = new JSInterpreter({studioApp: {}});
    });

    it("sets some default values", () => {
      expect(jsInterpreter.shouldRunAtMaxSpeed()).to.be.true;
      expect(jsInterpreter.maxInterpreterStepsPerTick).to.equal(10000);
    });

    it("sets some initial state", () => {
      expect(jsInterpreter.paused).to.be.false;
      expect(jsInterpreter.isExecuting).to.be.false;
    });

    it("does not initialize other things which get initialized later", () => {
      expect(jsInterpreter.interpreter).to.be.undefined;
      expect(jsInterpreter.globalScope).to.be.undefined;
    });
  });

  describe("basic usage when studioApp.hideSource = true", () => {
    beforeEach(() => {
      jsInterpreter = new JSInterpreter({studioApp: {hideSource: true}});
    });

    describe("the parse() method", () => {
      describe("when called with just code and no other special options", () => {
        beforeEach(() => {
          jsInterpreter.parse({code:''});
        });

        it("Initializes the interpreter", () => {
          expect(jsInterpreter.interpreter).to.be.an.instanceOf(Interpreter);
        });

        it("Initializes the isBreakpointRow function to always return false", () => {
          expect(jsInterpreter.isBreakpointRow()).to.be.false;
        });

        it("initializes the globalScope property", () => {
          expect(jsInterpreter.globalScope).not.to.be.null;
        });

        it("adds String.prototype.includes to the interpreter", () => {
          expect(jsInterpreter.evalInCurrentScope('"the quick brown fox".includes("brown")').valueOf()).to.be.true;
          expect(jsInterpreter.evalInCurrentScope('"the quick brown fox".includes("yellow")').valueOf()).to.be.false;
        });
      });

      describe("when called with globalFunctions", () => {
        beforeEach(() => jsInterpreter.parse({
          code: '',
          globalFunctions: {
            derp: {
              add: (a, b) => a + b,
              mul: (a, b) => a * b,
            },
            slerp: {
              sub: (a, b) => a - b,
            },
          },
        }));

        it("will make those global functions available to the code being interpreted", () => {
          expect(jsInterpreter.evalInCurrentScope('derp.add(3, 4)').valueOf()).to.equal(7);
          expect(jsInterpreter.evalInCurrentScope('derp.mul(3, 4)').valueOf()).to.equal(12);
          expect(jsInterpreter.evalInCurrentScope('slerp.sub(3, 4)').valueOf()).to.equal(-1);
        });
      });

      describe("when called with initGlobals", () => {
        it('will execute initGlobals during interpreter initialization, allowing calls to createGlobalProperty', () => {
          jsInterpreter.parse({
            code: '',
            initGlobals: () => {
              expect(jsInterpreter.interpreter).not.to.be.null;
              jsInterpreter.createGlobalProperty('hello', name => "hello, "+name);
              jsInterpreter.createGlobalProperty('NAME', "world");
            },
          });
          expect(jsInterpreter.evalInCurrentScope('hello(NAME)').valueOf()).to.equal("hello, world");
        });
      });

      describe("native event callbacks", () => {
        let lastCallback, config;

        beforeEach(() => {
          lastCallback = null;
          config = (allDone) => ({
            code:`
setCallback(function(message) {
  allDone(message);
  return "return value";
});
`,
            initGlobals: () => {
              jsInterpreter.createGlobalProperty('setCallback', (callback) => {
                lastCallback = callback;
              });
              jsInterpreter.createGlobalProperty('allDone', (message) => {
                allDone(message);
              });
            },
          });
        });

        it("will not work when enableEvents=false", () => {
          let allDone = sinon.spy();
          jsInterpreter.parse({
            enableEvents: false,
            ...config(allDone),
          });
          expect(() => jsInterpreter.executeInterpreter(true)).to.throwError;
          expect(lastCallback).to.be.null;
          expect(allDone).not.to.have.been.called;
        });

        describe("when enableEvents=true", () => {
          let allDone;
          beforeEach(() => {
            allDone = sinon.spy();
          });

          describe("a native callback function", () => {
            beforeEach(() => {
              jsInterpreter.parse({
                enableEvents: true,
                ...config(allDone),
              });
              sinon.spy(jsInterpreter, 'executeInterpreter');
              jsInterpreter.executeInterpreter(true);
            });

            it("will be created from the interpreter's callback function", () => {
              expect(lastCallback).to.be.a('function');
            });

            it("will call back into the interpreter's callback function", () => {
              expect(allDone).not.to.have.been.called;
              lastCallback();
              expect(allDone).to.have.been.calledOnce;
            });

            it("will pass arguments through to the interpreter's callback function", () => {
              lastCallback("some argument");
              expect(allDone).to.have.been.calledWith("some argument");
            });

            it("will return the value returned by the interpreter's callback function", () => {
              const returnValue = lastCallback();
              expect(returnValue).to.respondTo('valueOf');
              expect(returnValue.valueOf()).to.equal('return value');
            });

            it("will work even when the interpreter is not executing by executing it again", () => {
              expect(jsInterpreter.isExecuting).to.be.false;
              lastCallback();
              expect(jsInterpreter.executeInterpreter).to.have.been.calledTwice;
              expect(allDone).to.have.been.calledOnce;
            });

            it("will not execute after the interpreter has been deinitialized", () => {
              jsInterpreter.deinitialize();
              lastCallback();
              expect(allDone).not.to.have.been.called;
            });

          });

          describe("and the callback function is called from inside the interpreter's code", () => {
            beforeEach(() => {
              jsInterpreter.parse({
                enableEvents: true,
                ...config(allDone),
                code:`
function myCallback(message) {
  allDone(message);
  return "return value";
}
setCallback(myCallback);
myCallback("this message is coming from inside the interpreter");
`,
              });
              sinon.spy(jsInterpreter, 'executeInterpreter');
              jsInterpreter.executeInterpreter(true);
            });

            it("will not execute the interpreter again", () => {
              expect(jsInterpreter.executeInterpreter).to.have.been.calledOnce;
              expect(allDone).to.have.been.calledWith('this message is coming from inside the interpreter');
            });

          });

        });

      });
    });

  });

  describe("basic usage when studioApp.hideSource = false", () => {
    let aceGetSessionStub;
    beforeEach(() => {
      aceGetSessionStub = sinon.stub().returns({getBreakpoints: () => [false, false, true, false, true]});
      jsInterpreter = new JSInterpreter({
        studioApp: {
          editor: {
            aceEditor: {
              getSession: aceGetSessionStub,
            },
          },
        }
      });
    });

    describe("the parse() method", () => {

      beforeEach(() => jsInterpreter.parse({code: ''}));

      it("Initializes the isBreakpointRow() method to query the ace editor", () => {
        expect(jsInterpreter.isBreakpointRow(0)).to.be.false;
        expect(jsInterpreter.isBreakpointRow(2)).to.be.true;
      });
    });

  });

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
      return row === 3 || row === 5;
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
