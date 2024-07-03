import Interpreter from '@code-dot-org/js-interpreter';

import JSInterpreter from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';
import Observer from '@cdo/apps/Observer';

import {assert} from '../../../../util/reconfiguredChai';

describe('The JSInterpreter class', function () {
  var jsInterpreter;

  describe('static function getFunctionsAndMetadata', () => {
    it('returns no comment when no comment is passed', () => {
      let code = 'function testFunction() {}';
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].comment).toBe('');
    });

    let comment = 'comment';
    it('returns block comments as-is', () => {
      let multiLineComment = 'comment\nanother comment';
      let code = `/*\n${multiLineComment}\n*/\nfunction testFunction() {}`;
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].comment).toBe(multiLineComment);
    });

    it('returns no comment when an empty block comment is passed', () => {
      let code = '/**/\nfunction testFunction() {}';
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].comment).toBe('');
    });

    it('detects block comments with trailing spaces', () => {
      let code = `/*${comment}*/    \nfunction testFunction() {}`;
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].comment).toBe(`${comment}`);
    });

    it('strips stars from JSDocComments', () => {
      let code = `/**\n * ${comment}\n * ${comment}\n */\nfunction testFunction() {}`;
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].comment).toBe(`${comment}\n${comment}`);
    });

    it('returns multiple single-line comments', () => {
      let code = `//${comment}\n//${comment}\nfunction testFunction() {}`;
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].comment).toBe(`${comment}\n${comment}`);
    });

    it('returns no comment when an empty comment is passed', () => {
      let code = '//\nfunction testFunction() {}';
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].comment).toBe('');
    });

    it('returns no comment when a comment is more than one line away', () => {
      let code = '//comment\n\nfunction testFunction() {}';
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].comment).toBe('');
    });

    it('returns no parameters when no parameter is passed', () => {
      let code = 'function testFunction() {}';
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].parameters).toEqual([]);
    });

    it('returns all parameters passed', () => {
      let param1 = 'param1';
      let param2 = 'param2';
      let code = `function testFunction(${param1}, ${param2}) {}`;
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].parameters).toEqual(expect.arrayContaining([param1, param2]));
    });

    it('returns the name of the function', () => {
      let functionName = 'testFunction';
      let code = `function ${functionName}() {}`;
      let functions = JSInterpreter.getFunctionsAndMetadata(code);
      expect(functions[0].functionName).toBe(functionName);
    });
  });

  function initWithCode(code) {
    // Setup a jsInterpreter instance with `hideSource: true` so an editor isn't
    // needed.
    jsInterpreter = new JSInterpreter({
      shouldRunAtMaxSpeed: function () {
        return false;
      },
      studioApp: {hideSource: true},
    });

    // Initialize a test program
    jsInterpreter.calculateCodeInfo({code});
    jsInterpreter.parse({code: code});

    assert(jsInterpreter.initialized());

    // Step in
    jsInterpreter.paused = true;
    jsInterpreter.nextStep = JSInterpreter.StepType.IN;
    jsInterpreter.executeInterpreter(true);
  }

  function assertCurrentState(expected) {
    var state = jsInterpreter.interpreter.peekStackFrame();
    assert.containSubset(state, expected);
  }

  function stepAndVerify(expected) {
    jsInterpreter.nextStep = JSInterpreter.StepType.IN;
    jsInterpreter.executeInterpreter();
    assertCurrentState(expected);
  }

  function verifyStepSequence(expectedStates) {
    expectedStates.forEach(stepAndVerify);
  }

  describe('the constructor', () => {
    beforeEach(() => {
      jsInterpreter = new JSInterpreter({studioApp: {}});
    });

    it('sets some default values', () => {
      expect(jsInterpreter.shouldRunAtMaxSpeed()).toBe(true);
      expect(jsInterpreter.maxInterpreterStepsPerTick).toBe(10000);
    });

    it('sets some initial state', () => {
      expect(jsInterpreter.paused).toBe(false);
      expect(jsInterpreter.isExecuting).toBe(false);
    });

    it('does not initialize other things which get initialized later', () => {
      expect(jsInterpreter.interpreter).toBeUndefined();
      expect(jsInterpreter.globalScope).toBeUndefined();
    });
  });

  describe('basic usage when studioApp.hideSource = true', () => {
    beforeEach(() => {
      jsInterpreter = new JSInterpreter({studioApp: {hideSource: true}});
    });

    describe('the parse() method', () => {
      describe('when called with just code and no other special options', () => {
        beforeEach(() => {
          jsInterpreter.parse({code: ''});
        });

        it('Initializes the interpreter', () => {
          expect(jsInterpreter.interpreter).toBeInstanceOf(Interpreter);
        });

        it('Initializes the isBreakpointRow function to always return false', () => {
          expect(jsInterpreter.isBreakpointRow()).toBe(false);
        });

        it('initializes the globalScope property', () => {
          expect(jsInterpreter.globalScope).not.toBeNull();
        });

        it('adds String.prototype.includes to the interpreter', () => {
          expect(
            jsInterpreter
              .evalInCurrentScope('"the quick brown fox".includes("brown")')
              .valueOf()
          ).toBe(true);
          expect(
            jsInterpreter
              .evalInCurrentScope('"the quick brown fox".includes("yellow")')
              .valueOf()
          ).toBe(false);
        });
      });

      describe('when called with globalFunctions', () => {
        beforeEach(() =>
          jsInterpreter.parse({
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
          })
        );

        it('will make those global functions available to the code being interpreted', () => {
          expect(
            jsInterpreter.evalInCurrentScope('derp.add(3, 4)').valueOf()
          ).toBe(7);
          expect(
            jsInterpreter.evalInCurrentScope('derp.mul(3, 4)').valueOf()
          ).toBe(12);
          expect(
            jsInterpreter.evalInCurrentScope('slerp.sub(3, 4)').valueOf()
          ).toBe(-1);
        });
      });

      describe('when called with initGlobals', () => {
        it('will execute initGlobals during interpreter initialization, allowing calls to createGlobalProperty', () => {
          jsInterpreter.parse({
            code: '',
            initGlobals: () => {
              expect(jsInterpreter.interpreter).not.toBeNull();
              jsInterpreter.createGlobalProperty(
                'hello',
                name => 'hello, ' + name
              );
              jsInterpreter.createGlobalProperty('NAME', 'world');
            },
          });
          expect(
            jsInterpreter.evalInCurrentScope('hello(NAME)').valueOf()
          ).toBe('hello, world');
        });
      });

      describe('nativeCallsBackInterpreter stateful async function can access getCurrentState()', () => {
        it('will execute nativeCallsBackInterpreterFunc that uses getCurrentState() properly from within evalInCurrentScope', () => {
          jsInterpreter.parse({
            code: '',
            initGlobals: () => {
              expect(jsInterpreter.interpreter).not.toBeNull();
              const nativeCallsBackInterpreterFunc =
                jsInterpreter.interpreter.makeNativeMemberFunction({
                  nativeFunc: () => {
                    var state = jsInterpreter.getCurrentState();
                    if (!state.__callCount) {
                      state.__callCount = 1;
                    } else {
                      state.__callCount++;
                    }
                    if (state.__callCount < 3) {
                      state.doneExec_ = false;
                    } else {
                      state.doneExec_ = true;
                      return state.__callCount;
                    }
                  },
                  dontMarshal: false,
                  nativeParentObj: {},
                  maxDepth: 5,
                  nativeCallsBackInterpreter: true,
                });
              jsInterpreter.interpreter.setProperty(
                jsInterpreter.globalScope,
                'nativeCallsBackInterpreterFunc',
                jsInterpreter.interpreter.createNativeFunction(
                  nativeCallsBackInterpreterFunc
                )
              );
            },
          });
          expect(
            jsInterpreter
              .evalInCurrentScope('nativeCallsBackInterpreterFunc()')
              .valueOf()
          ).toBe(3);
        });
      });

      describe('customMarshalGlobalProperties available to eval', () => {
        it('can access customMarshalGlobalProperties property from within evalInCurrentScope', () => {
          const nativeParent = {testProp: 7};
          const jsInterpreterWithGlobalProps = new JSInterpreter({
            studioApp: {hideSource: true},
            customMarshalGlobalProperties: {testProp: nativeParent},
          });
          jsInterpreterWithGlobalProps.parse({
            code: '',
          });
          expect(
            jsInterpreterWithGlobalProps
              .evalInCurrentScope('testProp')
              .valueOf()
          ).toBe(7);
        });
      });

      describe('native event callbacks', () => {
        let lastCallback, config;

        beforeEach(() => {
          lastCallback = null;
          config = allDone => ({
            code: `
setCallback(function(message) {
  allDone(message);
  return "return value";
});
`,
            initGlobals: () => {
              jsInterpreter.createGlobalProperty('setCallback', callback => {
                lastCallback = callback;
              });
              jsInterpreter.createGlobalProperty('allDone', message => {
                allDone(message);
              });
            },
          });
        });

        it('will not work when enableEvents=false', () => {
          let allDone = jest.fn();
          jsInterpreter.parse({
            enableEvents: false,
            ...config(allDone),
          });
          expect(lastCallback).toBeNull();
          expect(allDone).not.toHaveBeenCalled();
        });

        describe('when enableEvents=true', () => {
          let allDone;
          beforeEach(() => {
            allDone = jest.fn();
          });

          describe('a native callback function', () => {
            beforeEach(() => {
              jsInterpreter.parse({
                enableEvents: true,
                ...config(allDone),
              });
              jest.spyOn(jsInterpreter, 'executeInterpreter').mockClear();
              jsInterpreter.executeInterpreter(true);
            });
            afterEach(() => {
              jest.restoreAllMocks();
            });

            it("will be created from the interpreter's callback function", () => {
              expect(lastCallback).toBeInstanceOf(Function);
            });

            it("will call back into the interpreter's callback function", () => {
              expect(allDone).not.toHaveBeenCalled();
              lastCallback();
              expect(allDone).toHaveBeenCalledTimes(1);
            });

            it("will pass arguments through to the interpreter's callback function", () => {
              lastCallback('some argument');
              expect(allDone).toHaveBeenCalledWith('some argument');
            });

            it("will return the value returned by the interpreter's callback function", () => {
              const returnValue = lastCallback();
              expect(returnValue).to.respondTo('valueOf');
              expect(returnValue.valueOf()).toBe('return value');
            });

            it('will work even when the interpreter is not executing by executing it again', () => {
              expect(jsInterpreter.isExecuting).toBe(false);
              lastCallback();
              expect(jsInterpreter.executeInterpreter).toHaveBeenCalledTimes(2);
              expect(allDone).toHaveBeenCalledTimes(1);
            });

            it('will not execute after the interpreter has been deinitialized', () => {
              jsInterpreter.deinitialize();
              lastCallback();
              expect(allDone).not.toHaveBeenCalled();
            });
          });

          describe("and the callback function is called from inside the interpreter's code", () => {
            beforeEach(() => {
              jsInterpreter.parse({
                enableEvents: true,
                ...config(allDone),
                code: `
function myCallback(message) {
  allDone(message);
  return "return value";
}
setCallback(myCallback);
myCallback("this message is coming from inside the interpreter");
`,
              });
              jest.spyOn(jsInterpreter, 'executeInterpreter').mockClear();
              jsInterpreter.executeInterpreter(true);
            });

            it('will not execute the interpreter again', () => {
              expect(jsInterpreter.executeInterpreter).toHaveBeenCalledTimes(1);
              expect(allDone).toHaveBeenCalledWith('this message is coming from inside the interpreter');
            });
          });
        });
      });
    });
  });

  describe('basic usage when studioApp.hideSource = false', () => {
    let aceGetSessionStub;
    beforeEach(() => {
      aceGetSessionStub = jest.fn()
        .mockReturnValue({getBreakpoints: () => [false, false, true, false, true]});
      jsInterpreter = new JSInterpreter({
        studioApp: {
          editor: {
            aceEditor: {
              getSession: aceGetSessionStub,
            },
          },
        },
      });
    });

    describe('the parse() method', () => {
      beforeEach(() => jsInterpreter.parse({code: ''}));

      it('Initializes the isBreakpointRow() method to query the ace editor', () => {
        expect(jsInterpreter.isBreakpointRow(0)).toBe(false);
        expect(jsInterpreter.isBreakpointRow(2)).toBe(true);
      });
    });
  });

  let aceEditor;
  let Range = function (startRow, startColumn, endRow, endColumn) {
    this.start = {
      row: startRow,
      column: startColumn,
    };

    this.end = {
      row: endRow,
      column: endColumn,
    };
  };

  function setupFakeAce() {
    let oldAce;
    let markerId = 1;
    beforeEach(() => {
      oldAce = window.ace;
      window.ace = {
        require: jest.fn().mockReturnValue({Range}),
      };
      const breakpoints = [];
      const aceSession = {
        addMarker: jest.fn(() => markerId++),
        getBreakpoints: jest.fn().mockReturnValue(breakpoints),
        removeMarker: jest.fn(),
      };
      aceEditor = {
        isRowFullyVisible: () => true,
        getSession: () => aceSession,
        getSelection: () => ({
          getRange: () => ({
            start: {},
            end: {},
          }),
          clearSelection: () => {},
        }),
      };
    });
    afterEach(() => {
      window.ace = oldAce;
    });
  }

  describe('executeInterpreter method', () => {
    let onPauseObserver;
    setupFakeAce();
    beforeEach(() => {
      jsInterpreter = new JSInterpreter({
        studioApp: {
          hideSource: false,
          editor: {
            aceEditor: aceEditor,
          },
          editCode: true,
        },
      });
      onPauseObserver = jest.fn();
      jsInterpreter.onPause.register(onPauseObserver);
      jest.spyOn(jsInterpreter, 'handleError').mockClear();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    function getCurrentLine() {
      const interpreter = jsInterpreter.interpreter;
      const interpreterValue = interpreter.getProperty(
        interpreter.global,
        'currentLine'
      );
      if (interpreterValue === interpreter.toBeUndefined()) {
        return undefined;
      }
      return interpreterValue.toNumber();
    }

    describe('When executed while logExecution=true', () => {
      beforeEach(() => {
        jsInterpreter.logExecution = true;
        jsInterpreter.parse({
          code: `
          var incrementor = {
            value: 1,
            next: function () { this.value++; }
          };
          function add(a) {
            for (var j = 0; j < a; j++) {
              incrementor.next();
            }
          }
          add(3);
        `,
        });
        jsInterpreter.executeInterpreter(true);
      });

      it('will populate the execution log with function calls and for loops', () => {
        expect(jsInterpreter.executionLog).toEqual([
          'add:1',
          '[forInit]',
          '[forTest]',
          'incrementor.next:0',
          '[forUpdate]',
          '[forTest]',
          'incrementor.next:0',
          '[forUpdate]',
          '[forTest]',
          'incrementor.next:0',
          '[forUpdate]',
          '[forTest]',
        ]);
      });
    });

    describe('When executed while breakpoints are set', () => {
      beforeEach(() => {
        aceEditor.getSession().getBreakpoints()[2] = true;
        aceEditor.getSession().getBreakpoints()[4] = true;
        jsInterpreter.parse({
          code: `
          var currentLine = 1;
          currentLine = 2;
          currentLine = 3;
          currentLine = 4;
          currentLine = 5;
        `,
        });
        jsInterpreter.executeInterpreter(true);
      });
      it('will stop executing at the breakpoint', () => {
        expect(getCurrentLine()).toBe(1);
      });
      it('will highlight the line after the breakpoint', () => {
        expect(aceEditor.getSession().addMarker.mock.lastCall[0]).toEqual({
          start: {
            row: 2,
            column: 10,
          },
          end: {
            row: 2,
            column: 26,
          },
        });
      });
      it('will notify the onPause observer', () => {
        expect(onPauseObserver).toHaveBeenCalled();
      });
      it('will set the next step to run', () => {
        expect(jsInterpreter.nextStep).toBe(JSInterpreter.StepType.RUN);
      });
      describe('and executed again after the breakpoint was reached', () => {
        beforeEach(() => {
          jsInterpreter.executeInterpreter(false);
        });
        it('will stop at the next breakpoint', () => {
          expect(getCurrentLine()).toBe(3);
        });
        it('will highlight the line after the breakpoint', () => {
          expect(
            aceEditor.getSession().addMarker.mock.lastCall[0]
          ).toEqual({
            start: {
              row: 4,
              column: 10,
            },
            end: {
              row: 4,
              column: 26,
            },
          });
        });
        describe('and executed again after all breakpoints have been reached', () => {
          beforeEach(() => {
            jsInterpreter.executeInterpreter(false);
          });
          it('will execute the rest of the code', () => {
            expect(getCurrentLine()).toBe(5);
          });
          it('will remove the highlight marker for the most recent highlight', () => {
            expect(
              aceEditor.getSession().removeMarker.mock.lastCall[0]
            ).toBe(aceEditor.getSession().addMarker.mock.lastCall.returnValue);
          });
        });
      });
    });

    describe('When executed with handleStepOver having been called while at a breakpoint', () => {
      beforeEach(() => {
        jsInterpreter.parse({
          code: `
          var currentLine = 1;
          currentLine = 2;
          currentLine = 3;
          currentLine = 4;
          currentLine = 5;
        `,
        });
        aceEditor.getSession().getBreakpoints()[2] = true;
        jsInterpreter.executeInterpreter(true);
        jsInterpreter.handleStepOver();
        jsInterpreter.executeInterpreter(false);
      });

      it('will execute the line that the breakpoint is on and move to the next one', () => {
        expect(getCurrentLine()).toBe(2);
      });
      it('will highlight the line after the step over', () => {
        expect(aceEditor.getSession().addMarker.mock.lastCall[0]).toEqual({
          start: {
            row: 3,
            column: 10,
          },
          end: {
            row: 3,
            column: 26,
          },
        });
      });
    });

    describe('When executed with handleStepOut having been called', () => {
      beforeEach(() => {
        jsInterpreter.parse({
          code: `
          function breakInHere() {
            var innerFunctionScope = true;
            currentLine = 3; // breakpoint set here
          }
          var currentLine = 5;
          breakInHere();
          currentLine = 7;
        `,
        });
        aceEditor.getSession().getBreakpoints()[3] = true;
        // go to breakpoint on currentLine = 3;
        jsInterpreter.executeInterpreter(true);
        jsInterpreter.handleStepOut();
        jsInterpreter.executeInterpreter(false);
      });

      it('will execute the interpreter until the function is complete', () => {
        expect(
          jsInterpreter.interpreter.hasProperty(
            jsInterpreter.interpreter.getScope(),
            'innerFunctionScope'
          )
        ).toBe(false);
        expect(getCurrentLine()).toBe(3);
      });
      it('will highlight the line after the function call', () => {
        expect(aceEditor.getSession().addMarker.mock.lastCall[0]).toEqual({
          start: {
            row: 7,
            column: 10,
          },
          end: {
            row: 7,
            column: 26,
          },
        });
      });
    });

    describe('When executed with handleStepOut having been called inside a deeply nested function call', () => {
      beforeEach(() => {
        jsInterpreter.parse({
          code: `
          function breakInHere() {
            var innerFunctionScope = true;
            currentLine = 3; // breakpoint set here
          }
          function breakLowerDown() {
            var middleFunctionScope = true;
            breakInHere();
            currentLine = 8;
          }
          var currentLine = 10;
          breakLowerDown();
          currentLine = 12;
        `,
        });
        aceEditor.getSession().getBreakpoints()[3] = true;
        // go to breakpoint on currentLine = 3;
        jsInterpreter.executeInterpreter(true);
        jsInterpreter.handleStepOut();
        jsInterpreter.executeInterpreter(false);
      });

      it('will execute the interpreter until the inner function is complete', () => {
        expect(
          jsInterpreter.interpreter.hasProperty(
            jsInterpreter.interpreter.getScope(),
            'innerFunctionScope'
          )
        ).toBe(false);
        expect(getCurrentLine()).toBe(3);
        expect(
          jsInterpreter.interpreter.hasProperty(
            jsInterpreter.interpreter.getScope(),
            'middleFunctionScope'
          )
        ).toBe(true);
      });
      it('will highlight the line after the inner function call', () => {
        expect(aceEditor.getSession().addMarker.mock.lastCall[0]).toEqual({
          start: {
            row: 8,
            column: 12,
          },
          end: {
            row: 8,
            column: 28,
          },
        });
      });

      describe('and we step out again', () => {
        beforeEach(() => {
          jsInterpreter.handleStepOut();
          jsInterpreter.executeInterpreter(false);
        });
        it('will step out again', () => {
          expect(getCurrentLine()).toBe(8);
        });
        it('will highlight the line after the inner function call', () => {
          expect(
            aceEditor.getSession().addMarker.mock.lastCall[0]
          ).toEqual({
            start: {
              row: 12,
              column: 10,
            },
            end: {
              row: 12,
              column: 27,
            },
          });
        });
      });
    });

    describe('When executed with handleStepOver having been called on a line triggering a breakpoint', () => {
      beforeEach(() => {
        jsInterpreter.parse({
          code: `
          var currentLine = 1;
          function breakInHere() {
            var innerFunctionScope = true;
            currentLine = 4; // breakpoint set here
          }
          currentLine = 6; // breakpoint set here
          breakInHere();
          currentLine = 7;
        `,
        });
        aceEditor.getSession().getBreakpoints()[4] = true;
        aceEditor.getSession().getBreakpoints()[6] = true;
        // go to breakpoint on currentLine = 6;
        jsInterpreter.executeInterpreter(true);
        jsInterpreter.handleStepOver();
        // step over currentLine = 6;
        jsInterpreter.executeInterpreter(false);
        jsInterpreter.handleStepOver();
        // try stepping over breakInHere()
        jsInterpreter.executeInterpreter(false);
      });
      it('will stop stepping over the line and pause at the breakpoint instead', () => {
        expect(getCurrentLine()).toBe(6);
        expect(
          jsInterpreter.interpreter.hasProperty(
            jsInterpreter.interpreter.getScope(),
            'innerFunctionScope'
          )
        ).toBe(true);
        jsInterpreter.handleStepOver();
        jsInterpreter.executeInterpreter(false);
        expect(getCurrentLine()).toBe(4);
      });
      it('will highlight the line at the inner breakpoint', () => {
        expect(aceEditor.getSession().addMarker.mock.lastCall[0]).toEqual({
          start: {
            row: 4,
            column: 12,
          },
          end: {
            row: 4,
            column: 28,
          },
        });
      });
    });

    describe('When executed after handleStepIn() is called', () => {
      beforeEach(() => {
        jsInterpreter.parse({
          code: `
          var currentLine = 1;
          currentLine = 2;
          currentLine = 3;
        `,
        });
        jsInterpreter.handleStepIn();
        jsInterpreter.executeInterpreter(true);
      });
      it('will set the next step type to RUN', () => {
        expect(jsInterpreter.nextStep).toBe(JSInterpreter.StepType.RUN);
      });
      it('will put the interpreter into the paused state', () => {
        expect(jsInterpreter.paused).toBe(true);
      });
      it('will not execute the line it steps onto', () => {
        expect(getCurrentLine()).toBeUndefined();
      });
      it('will highlight the first line', () => {
        expect(aceEditor.getSession().addMarker.mock.lastCall[0]).toEqual({
          start: {
            row: 1,
            column: 10,
          },
          end: {
            row: 1,
            column: 30,
          },
        });
      });

      describe('And after handleStepOver is subsequently called', () => {
        beforeEach(() => {
          jsInterpreter.handleStepOver();
          jsInterpreter.executeInterpreter(false);
        });
        it('will execute the line it is currently on', () => {
          expect(getCurrentLine()).toBe(1);
        });
        it('will highlight the line after the step over', () => {
          expect(
            aceEditor.getSession().addMarker.mock.lastCall[0]
          ).toEqual({
            start: {
              row: 2,
              column: 10,
            },
            end: {
              row: 2,
              column: 26,
            },
          });
        });
        it('will keep the interpreter in the paused state', () => {
          expect(jsInterpreter.paused).toBe(true);
        });

        describe('And after handlePauseContinue is subsequently called', () => {
          beforeEach(() => {
            jsInterpreter.handlePauseContinue();
            jsInterpreter.executeInterpreter(false);
          });
          it('will execute the rest of the code', () => {
            expect(getCurrentLine()).toBe(3);
          });
          it('will remove the highlight marker for the most recent highlight', () => {
            expect(
              aceEditor.getSession().removeMarker.mock.lastCall[0]
            ).toBe(aceEditor.getSession().addMarker.mock.lastCall.returnValue);
          });
          it('will make the interpreter no longer paused', () => {
            expect(jsInterpreter.paused).toBe(false);
          });
        });
      });
    });

    describe('When executing code that throws a runtime error', () => {
      beforeEach(() => {
        jsInterpreter.parse({
          code: `
          throw "gotcha";
        `,
        });
      });
      describe('with hideSource=false', () => {
        beforeEach(() => {
          jsInterpreter.studioApp.hideSource = false;
          jsInterpreter.executeInterpreter(true);
        });
        it('will call the handleError method with the line number the error occurred on.', () => {
          expect(jsInterpreter.handleError).toHaveBeenCalled();
          expect(jsInterpreter.handleError).toHaveBeenCalledWith(2);
        });
        it("will highlight as an error the first character of the program since the exception wasn't handled", () => {
          expect(
            aceEditor.getSession().addMarker.mock.lastCall[0]
          ).toEqual({
            start: {
              row: 0,
              column: 0,
            },
            end: {
              row: 1,
              column: 0,
            },
          });
          expect(aceEditor.getSession().addMarker.mock.lastCall[1]).toBe('ace_error');
        });
      });
      describe('with hideSource=true', () => {
        beforeEach(() => {
          jsInterpreter.studioApp.hideSource = true;
          jsInterpreter.executeInterpreter(true);
        });
        it('will populate the executionError property of the interpreter', () => {
          expect(jsInterpreter.executionError).toBeDefined();
          expect(jsInterpreter.executionError).toBe('gotcha');
        });
        it('will call the handleError method.', () => {
          expect(jsInterpreter.handleError).toHaveBeenCalled();
        });
        it('will set the isExecuting flag to false', () => {
          expect(jsInterpreter.isExecuting).toBe(false);
        });
      });
    });
  });

  it('steps a `for` loop', function () {
    initWithCode('for (var i = 0; i < 2; i++) { 1; }');
    assertCurrentState({node: {type: 'ForStatement'}, mode: undefined});

    // Continue stepping
    verifyStepSequence([
      {node: {type: 'ForStatement'}, mode_: 1}, // (test) i < 2;
      {node: {type: 'ExpressionStatement'}}, // (body) 1;
      {node: {type: 'ForStatement'}, mode_: 3}, // (update) i++
      {node: {type: 'ForStatement'}, mode_: 1}, // (test) i < 2;
      {node: {type: 'ExpressionStatement'}}, // (body) 1;
      {node: {type: 'ForStatement'}, mode_: 3}, // (update) i++
      {node: {type: 'ForStatement'}, mode_: 1}, // (test) i < 2;
    ]);
  });

  it('steps a `switch` statement', function () {
    initWithCode('switch (5) { case 5: 1; } 2;');
    assertCurrentState({node: {type: 'SwitchStatement'}});

    // Continue stepping
    verifyStepSequence([
      {node: {type: 'SwitchStatement'}},
      {node: {type: 'ExpressionStatement', expression: {value: 1}}},
      {node: {type: 'ExpressionStatement', expression: {value: 2}}},
    ]);
  });

  it('hits a breakpoint', function () {
    initWithCode('0;\n1;\n2;\n3;\n4;\n5;\n6;\n7;');
    jsInterpreter.isBreakpointRow = function (row) {
      return row === 3 || row === 5;
    };

    var observer = new Observer(),
      hitBreakpoint = false,
      MAX_STEPS = 100,
      i;
    observer.observe(jsInterpreter.onPause, function () {
      hitBreakpoint = true;
    });

    jsInterpreter.paused = false;

    for (i = 0; !hitBreakpoint && i < MAX_STEPS; i++) {
      jsInterpreter.executeInterpreter();
    }
    hitBreakpoint = false;
    assertCurrentState({
      node: {type: 'ExpressionStatement', expression: {value: 3}},
    });

    for (i = 0; !hitBreakpoint && i < MAX_STEPS; i++) {
      jsInterpreter.executeInterpreter();
    }
    hitBreakpoint = false;
    assertCurrentState({
      node: {type: 'ExpressionStatement', expression: {value: 5}},
    });
  });
});
