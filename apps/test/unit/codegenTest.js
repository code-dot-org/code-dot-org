import sinon from 'sinon';
import {assert, expect} from '../util/configuredChai';
import * as codegen from '@cdo/apps/codegen';
import PatchedInterpreter from '@cdo/apps/lib/tools/jsinterpreter/PatchedInterpreter';

describe("codegen", function () {

  describe("generates cumulative length stats", function () {
    it("one line", function () {
      assert.deepEqual([0, 2], codegen.calculateCumulativeLength('z'));
    });
    it("LF", function () {
      assert.deepEqual([0, 3, 8, 14, 15], codegen.calculateCumulativeLength('1;\n234;\n5678;\n'));
    });
    it("CRLF", function () {
      assert.deepEqual([0, 4, 10, 16], codegen.calculateCumulativeLength('1;\r\n234;\r\n5678;'));
    });
    it("mixed CRLF and LF", function () {
      assert.deepEqual([0, 17, 34, 36], codegen.calculateCumulativeLength('while (false) {\r\n  doSomething();\n}'));
    });
    it("with some lines empty", function () {
      assert.deepEqual([0, 3, 4, 6, 9, 10, 11], codegen.calculateCumulativeLength('1;\n\n\r\n2;\n\n'));
    });
  });

  describe("marshalNativeToInterpreter function", () => {
    let interpreter, globalScope, value;
    beforeEach(() => {
      interpreter = new PatchedInterpreter('', (interpreter, scope) => {
        globalScope = scope;
        interpreter.setProperty(scope, 'assert', interpreter.createNativeFunction((truthy, message) => {
          if (truthy !== interpreter.TRUE) {
            console.log(interpreter.stateStack[interpreter.stateStack.length - 1]);
            throw new Error(message);
          }
        }));
      });
      sinon.spy(interpreter, 'createPrimitive');
    });

    /**
     * Given the params for the codegen.marshalNativeToInterpreter function, executed some code
     * inside the interpreter that can make assertions about the marshaled object.
     *
     * @param {string} assertion - some code to run in the interpreter. This code will have
     *     access to a global assert() function which will throw an error in native land if
     *     the assertion fails.
     * @param nativeVar - same as nativeVar param of marshalNativeToInterpreter
     * @param nativeParentObj - same as nativeParentObj param of marshalNativeToInterpreter
     * @param maxDepth - same as maxDepth param of marshalNativeToInterpreter
     * @returns void
     */
    function makeAssertion(assertion, nativeVar, nativeParentObj, maxDepth) {
      let interpreter = new PatchedInterpreter(assertion, (interpreter, scope) => {
        globalScope = scope;
        interpreter.setProperty(scope, 'assert', interpreter.createNativeFunction((truthy, message) => {
          if (truthy !== interpreter.TRUE) {
            console.log(interpreter.stateStack[interpreter.stateStack.length - 1]);
            throw new Error("failed assertion: " + assertion);
          }
        }));
        const interpreterValue = codegen.marshalNativeToInterpreter(
          interpreter,
          nativeVar,
          nativeParentObj,
          maxDepth
        );
        interpreter.setProperty(globalScope, 'value', interpreterValue);
      });
      interpreter.run();
    }

    function makeAssertableObj(nativeVar, nativeParentObj, maxDepth) {
      return {assert: assertion => makeAssertion(assertion, nativeVar, nativeParentObj, maxDepth)};
    }

    it("when given an undefined native variable, will return an undefined interpreter variable", () => {
      expect(codegen.marshalNativeToInterpreter(interpreter, undefined)).to.equal(interpreter.UNDEFINED);
    });

    it("will delegate to the interpreter's createPrimitive function for booleans, numbers, and strings", () => {
      codegen.marshalNativeToInterpreter(interpreter, true);
      expect(interpreter.createPrimitive).to.have.been.calledWith(true);
      codegen.marshalNativeToInterpreter(interpreter, 5);
      expect(interpreter.createPrimitive).to.have.been.calledWith(5);
      codegen.marshalNativeToInterpreter(interpreter, "some string");
      expect(interpreter.createPrimitive).to.have.been.calledWith("some string");
    });

    describe("when given an empty object to marshal, the corresponding interpreter object", () => {
      beforeEach(() => {
        value = makeAssertableObj({});
      });
      it("will be an object", () => {
        value.assert(`assert(typeof value === "object");`);
      });

      it("will contain no keys", () => {
        value.assert(
          `for (var key in value) {
            assert(false);
          }`
        );
      });
    });

    describe("when given an object with some keys, the corresponding interpreter object", () => {
      beforeEach(() => {
        value = makeAssertableObj({a: 1, b: true, c: "three"});
      });
      it("will be an object with those keys/values", () => {
        value.assert(`assert(value.a === 1)`);
        value.assert(`assert(value.b === true)`);
        value.assert(`assert(value.c === "three")`);
      });
    });

    describe("when given an object with more nested objects, the corresponding interpreter object", () => {
      beforeEach(() => {
        value = makeAssertableObj({a: {b: {c: "three"}}});
      });
      it("will be an object with the same set of nested objects", () => {
        value.assert(`assert(value.a.b.c === "three")`);
      });
    });

    describe("when given a maxDepth parameter, the corresponding interpreter object", () => {
      let value0, value1, value2, value3, value4;
      beforeEach(() => {
        const nested = {level: 1, a: {level: 2, b: {level: 3, c: "three"}}};
        value0 = makeAssertableObj(nested, null, 0);
        value1 = makeAssertableObj(nested, null, 1);
        value2 = makeAssertableObj(nested, null, 2);
        value3 = makeAssertableObj(nested, null, 3);
        value4 = makeAssertableObj(nested, null, 4);
      });
      it("will be limited to the depth specified by maxDepth", () => {
        value0.assert(`assert(value === undefined)`);
        value1.assert(`assert(value.a === undefined)`);
        value2.assert(`assert(value.level === 1)`);
        value2.assert(`assert(value.a.b === undefined)`);
        value3.assert(`assert(value.a.level === 2)`);
        value3.assert(`assert(value.a.b.c === undefined)`);
        value4.assert(`assert(value.a.b.level === 3)`);
      });
    });

    describe("when given a native array, the corresponding interpreter object", () => {
      let value0, value1, value2;
      beforeEach(() => {
        const nested = [1, [2, [3, "four"]]];
        value = makeAssertableObj(nested);
        value0 = makeAssertableObj(nested, null, 0);
        value1 = makeAssertableObj(nested, null, 1);
        value2 = makeAssertableObj(nested, null, 2);
      });

      it("will be an array", () => {
        value.assert(`assert(value instanceof Array)`);
      });

      it("will contain the same set of elements", () => {
        value.assert(`assert(value[0] === 1)`);
        value.assert(`assert(value[1][0] === 2)`);
        value.assert(`assert(value[1][1][0] === 3)`);
        value.assert(`assert(value[1][1][1] === 'four')`);
      });

      it("will be limited in depth specified by maxDepth", () => {
        value0.assert(`assert(value === undefined)`);
        value1.assert(`assert(value instanceof Array)`);
        value1.assert(`assert(value.length === 2)`);
        value1.assert(`assert(value[0] === undefined)`);
        value1.assert(`assert(value[1] === undefined)`);
        value2.assert(`assert(value[0] === 1)`);
        value2.assert(`assert(value[1] instanceof Array)`);
        value2.assert(`assert(value[1].length === 2)`);
        value2.assert(`assert(value[1][0] === undefined)`);
        value2.assert(`assert(value[1][1] === undefined)`);
      });
    });

    describe("when given an interpreter function object", () => {
      it("will just return the exact same interpreter function object it was given", () => {
        const interpreterFunc = interpreter.getProperty(interpreter.getScope(), 'isNaN');
        expect(codegen.marshalNativeToInterpreter(
          interpreter,
          interpreterFunc,
        )).to.equal(interpreterFunc);
      });
    });

    describe("when given canvas image data (Uint8ClampedArray instances), the corresponding interpreter object", () => {
      beforeEach(() => {
        value = makeAssertableObj(new Uint8ClampedArray(100));
      });

      it("will be an array", () => {
        value.assert(`assert(value instanceof Array)`);
        value.assert(`assert(value.length === 100)`);
        value.assert(`for (var i = 0; i < value.length; i++) { assert(value[i] === 0); }`);
      });
    });

    describe("when given a native function, the corresponding interpreter object", () => {
      let nativeFunc;
      beforeEach(() => {
        nativeFunc = function (a, b) {
          return a + b;
        };
        Object.defineProperty(
          nativeFunc,
          'foo',
          {
            enumerable: true,
            value: 'bar'
          }
        );
        Object.defineProperty(
          nativeFunc,
          'throwsOnRead',
          {
            enumerable: true,
            get: () => {
              throw new Error("can't read this");
            }
          }
        );
        nativeFunc['foo'] === 'bar';
        value = makeAssertableObj(nativeFunc);
      });

      it("will be a function", () => {
        value.assert(`assert(typeof value === 'function')`);
        value.assert(`assert(value(1,2) === 3)`);
      });

      it("will have the same properties as the native function", () => {
        value.assert(`assert(value.foo === 'bar')`);
      });

      it("will skip properties of the native function that cannot be read", () => {
        value.assert(`assert(value.throwsOnRead === undefined)`);
      });

      it("will skip the inherits and trigger properties if present", () => {
        expect(nativeFunc.inherits).to.be.defined;
        value.assert(`assert(value.inherits === undefined)`);
        expect(nativeFunc.trigger).to.be.defined;
        value.assert(`assert(value.trigger === undefined)`);
      });
    });

  });

  describe("evalWithEvents function", () => {
    let hooks, globals;
    beforeEach(() => {
      globals = {
        a: sinon.spy(),
        b: sinon.spy(),
        c: sinon.spy(),
      };
    });

    it("will return an empty array of hooks if no events are provided", () => {
      expect(codegen.evalWithEvents({}, {}).hooks).to.deep.equal([]);
    });

    it("will return the interpreter that was created to run the code", () => {
      expect(codegen.evalWithEvents({}, {}).interpreter).to.be.an.instanceOf(PatchedInterpreter);
    });

    describe("when given event handlers that accept arguments", () => {
      beforeEach(() => {
        hooks = codegen.evalWithEvents(
          globals,
          {
            takesArgs: {code: 'c(foo*2, bar/3)', args: ['foo', 'bar']},
          }
        ).hooks;
      });
      it("will pass the args provided to the hook along to the event handler", () => {
        hooks[0].func(5, 6);
        expect(globals.c).to.have.been.calledWith(10, 2);
      });
    });

    describe("when given event handlers that return values", () => {
      beforeEach(() => {
        hooks = codegen.evalWithEvents(
          globals,
          {
            returnsValues: {code: 'return 5'},
          }
        ).hooks;
      });
      it("will return the values returned by the event handler back to the caller of the hook", () => {
        expect(hooks[0].func()).to.equal(5);
      });
    });

    describe("when given additional code to evaluate", () => {
      beforeEach(() => {
        hooks = codegen.evalWithEvents(
          globals,
          {
            someEvent: {code: 'b()'},
          },
          'a();',
        ).hooks;
      });

      it("will evaluate that code immediately", () => {
        expect(globals.a).to.have.been.called;
      });

      it("will continue waiting for the various hooks to be called", () => {
        hooks[0].func();
        expect(globals.b).to.have.been.called;
      });

      it("will throw an unexpected token exception when given code that does not end with a semicolon", () => {
        expect(() => codegen.evalWithEvents(globals, {someEvent: {code: 'b()'}}, 'a()')).to.throw('Unexpected token');
      });
    });

    describe("when given a set of events handlers that call the provided global functions", () => {
      beforeEach(() => {
        hooks = codegen.evalWithEvents(
          globals,
          {
            someEvent: {code: ['a()', 'b()']},
            someOtherEvent: {code: 'c()'},
          }
        ).hooks;
      });

      it("will return a hook for each event handler of each event type that was given", () => {
        expect(hooks.length).to.equal(3);
      });

      it("each returned hook will have a name property corresponding to the event name it is connected to", () => {
        expect(hooks.map(hook => hook.name)).to.deep.equal([
          'someEvent',
          'someEvent',
          'someOtherEvent',
        ]);
      });

      it("will call the appropriate event handlers when those hooks get called", () => {
        expect(hooks[0].name).to.equal('someEvent');
        hooks[0].func();
        expect(globals.a).to.have.been.called;
        expect(globals.b).not.to.have.been.called;
        expect(globals.c).not.to.have.been.called;
        hooks[2].func();
        expect(globals.c).to.have.been.called;
      });
    });

  });

  describe("evalWith function", () => {
    let options;
    beforeEach(() => {
      options = {
        add: sinon.spy(),
        a: 3,
      };
      window.nativeAdd = sinon.spy();
    });

    afterEach(() => {
      delete window.nativeAdd;
    });

    it("evaluates a string of code, prepopulating the scope with whatever is in options", () => {
      expect(codegen.evalWith('add(1,2)', options)).to.be.undefined;
      expect(options.add).to.have.been.calledWith(1,2);
      expect(codegen.evalWith('add(a,2)', options)).to.be.undefined;
      expect(options.add).to.have.been.calledWith(3,2);
    });

    it("does not give the evaluated code access to native functions", () => {
      expect(() => codegen.evalWith('nativeAdd(1,2)', options)).to.throw('Unknown identifier: nativeAdd');
    });

    describe("when running with legacy=true", () => {

      it("the evaluated code will have access to 'native' functions", () => {
        expect(() => codegen.evalWith('nativeAdd(1,2)', options, true)).not.to.throw;
        codegen.evalWith('nativeAdd(1,2)', options, true);
        expect(window.nativeAdd).to.have.been.calledWith(1,2);
        codegen.evalWith('nativeAdd(1,2)', options, true);
        expect(window.nativeAdd).to.have.been.calledWith(1,2);
      });

      it("the evaluated code will have access to functions passed in through options", () => {
        codegen.evalWith('add(1,2)', options, true);
        expect(options.add).to.have.been.calledWith(1,2);
      });

      it("the evaluated code will have access to variables passed in through options", () => {
        codegen.evalWith('add(a,2)', options, true);
        expect(options.add).to.have.been.calledWith(3,2);
        codegen.evalWith('nativeAdd(a,2)', options, true);
        expect(window.nativeAdd).to.have.been.calledWith(3,2);
      });

    });
  });

});
