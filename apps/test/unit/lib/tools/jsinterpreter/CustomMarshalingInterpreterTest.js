import sinon from 'sinon';
import Interpreter from '@code-dot-org/js-interpreter';
import {expect} from '../../../../util/configuredChai';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import CustomMarshaler from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshaler';
import {makeAssertableObj, attachAssertToInterpreter} from './interpreterTestUtils';

describe("The CustomMarshalingInterpreter", () => {

  let interpreter, customMarshaler;
  beforeEach(() => {
    customMarshaler = new CustomMarshaler({});
    interpreter = new CustomMarshalingInterpreter('', customMarshaler);
    sinon.spy(Interpreter.prototype, 'getProperty');
    sinon.spy(Interpreter.prototype, 'setProperty');
    sinon.spy(Interpreter.prototype, 'hasProperty');
  });
  afterEach(() => {
    Interpreter.prototype.getProperty.restore();
    Interpreter.prototype.setProperty.restore();
    Interpreter.prototype.hasProperty.restore();
  });

  describe("when given an object that should be custom marshaled", () => {

    let value;
    class Foo {
      constructor(name) {
        this.name = name;
      }
      whatsMyName() {
        return this.name;
      }
      add(suffix) {
        return new Foo(this.name + suffix);
      }
    }

    beforeEach(() => {
      interpreter.customMarshaler.objectList = [{
        instance: Foo,
      }];
      value = makeAssertableObj(interpreter, new Foo("hello world"));
    });

    it("will create a custom marshal object", () => {
      expect(value.interpreterValue.isCustomMarshal).to.be.true;
    });

    describe("the custom marshal object", () => {
      it("will have a data property set to the original native value", () => {
        expect(value.interpreterValue.data).to.equal(value.nativeValue);
      });

      it("is not a primitive", () => {
        expect(value.interpreterValue.isPrimitive).to.be.false;
      });

      it("is the same type as the native object", () => {
        expect(value.interpreterValue.type).to.equal('object');
      });

      it("will have a valueOf method that returns the original native value", () => {
        expect(value.interpreterValue.valueOf()).to.equal(value.nativeValue);
      });
    });

    describe("the resulting object inside the interpreter", () => {
      it("will contain the various properties of that object", () => {
        value.assert(`assert(value.name === "hello world");`);
      });
      it("will contain the various methods of that object", () => {
        value.assert(`assert(value.whatsMyName() === "hello world")`);
        value.assert(`assert(value.add("!").whatsMyName() === "hello world!")`);
      });
    });
  });

  describe("when given an object that is custom marshaled with a requiredMethod", () => {
    let value;
    beforeEach(() => {
      interpreter.customMarshaler.objectList = [{
        instance: Array,
        requiredMethod: 'draw',
      }];
      const nativeValue = [1,2,3];
      nativeValue.draw = function () {
        return this.join(',');
      };
      value = makeAssertableObj(interpreter, nativeValue);
    });

    it("will only custom marshal the object when the requiredMethod is present", () => {
      expect(value.interpreterValue.isCustomMarshal).to.be.true;
      expect(makeAssertableObj(interpreter, []).interpreterValue.isCustomMarshal).not.to.be.true;
    });

    it("will make sure the required method gets included in the custom marshaled object", () => {
      value.assert(`assert(value.draw() === "1,2,3")`);
    });
  });

  describe("the constructor", () => {
    it("requires passing in a custom marshaler instance", () => {
      expect(() => new CustomMarshalingInterpreter('foo = true;')).to.throw(
        "You must provide a CustomMarshaler to CustomMarshalingInterpreter"
      );
    });
  });

  describe("setProperty method", () => {
    it("delegates to the base class's setProperty method under normal circumstances", () => {
      interpreter = new CustomMarshalingInterpreter('foo = true; foo.bar = false', customMarshaler);
      interpreter.run();
      expect(Interpreter.prototype.setProperty).to.have.been.calledWith(
        interpreter.global,
        'foo',
        interpreter.TRUE
      );
      expect(Interpreter.prototype.setProperty).to.have.been.calledWith(
        interpreter.getProperty(interpreter.global, 'foo'),
        'bar',
        interpreter.FALSE
      );
    });

    describe("when used for setting properties on custom marshaled objects", () => {
      let nativeObject;
      beforeEach(() => {
        nativeObject = {};
        interpreter = new CustomMarshalingInterpreter('custom.fromInterpreter = "hello";', customMarshaler);
        interpreter.setProperty(
          interpreter.global,
          "custom",
          interpreter.customMarshaler.createCustomMarshalObject(nativeObject)
        );
      });

      it("will set the property on the native object", () => {
        interpreter.run();
        expect(nativeObject.fromInterpreter).to.equal('hello');
      });

      describe("and the property name is in the list of properties blocked from custom marshaling", () => {
        beforeEach(() => {
          interpreter = new CustomMarshalingInterpreter(
            'custom.fromInterpreter = "hello";',
            new CustomMarshaler({blockedProperties: ['fromInterpreter']})
          );
          interpreter.setProperty(
            interpreter.global,
            "custom",
            interpreter.customMarshaler.createCustomMarshalObject(nativeObject)
          );
        });

        it("will not set the property on the native object", () => {
          interpreter.run();
          expect(nativeObject.fromInterpreter).to.be.undefined;
        });
      });

      describe("and the property value is a Node or Window object", () => {
        it("will not set the property on the interpreter object", () => {
          nativeObject = {
            someProp: "hello",
            realWindow: window,
            realBody: document.body,
          };
          [
            `assert(value.someProp === "hello");`,
            `assert(value.realWindow === undefined);`,
            `assert(value.realBody === undefined);`,
          ].forEach(assertion => {
            interpreter = new CustomMarshalingInterpreter(
              assertion,
              new CustomMarshaler({}),
              (interpreter, scope) => {
                attachAssertToInterpreter(interpreter, scope, `assert(value.someProp === "hello")`);
                interpreter.setProperty(
                  scope,
                  'value',
                  interpreter.customMarshaler.createCustomMarshalObject(nativeObject)
                );
              }
            );
            interpreter.run();
          });
        });
      });
    });

    describe("when used for setting properties on custom marshaled globals", () => {
      let player;
      beforeEach(() => {
        player = {};
        customMarshaler = new CustomMarshaler({
          globalProperties: {
            name: player
          }
        });
      });

      it("will set the property on the global for the given name", () => {
        new CustomMarshalingInterpreter('name = "Paul"', customMarshaler).run();
        expect(player.name).to.equal("Paul");
      });

      it("will correctly walk the scope chain if necessary to set the property", () => {
        new CustomMarshalingInterpreter(
          `function makeNameSetter(newName) {
            return function() {
              name = newName;
            }
          }
          var setNameToPaul = makeNameSetter("Paul")
          setNameToPaul();
          `,
          customMarshaler
        ).run();
        expect(player.name).to.equal("Paul");
      });

      describe("when used to set properties that are blocked from custom marshaling", () => {
        beforeEach(() => {
          customMarshaler = new CustomMarshaler({
            globalProperties: customMarshaler.globalProperties,
            blockedProperties: ['name'],
          });
        });
        it("will not set the property on the corresponding global", () => {
          new CustomMarshalingInterpreter('name = "Paul"', customMarshaler).run();
          expect(player.name).to.be.undefined;
        });
      });
    });
  });

  it("will walk the scope chain if necessary to set a property", () => {
    interpreter = new CustomMarshalingInterpreter(
      `var name;
       function makeNameSetter(newName) {
         return function() {
           name = newName;
         }
       }
       var setNameToPaul = makeNameSetter("Paul")
       setNameToPaul();`,
      customMarshaler
    );
    interpreter.run();
    expect(interpreter.getProperty(interpreter.global, 'name').toString()).to.equal("Paul");
  });

  it("will throw an exception when trying to set an undeclared variabled in strict mode", () => {
    interpreter = new CustomMarshalingInterpreter(
      `"use strict";
       function makeNameSetter(newName) {
         return function() {
           name = newName;
         }
       }
       var setNameToPaul = makeNameSetter("Paul")
       setNameToPaul();`,
      customMarshaler
    );
    expect(() => interpreter.run()).to.throw('Unknown identifier: name');
  });

  it("will throw an exception when trying to reference an undeclared variable", () => {
    interpreter = new CustomMarshalingInterpreter(
      `parseInt(someUndeclaredVariable)`,
      customMarshaler
    );
    expect(() => interpreter.run()).to.throw('someUndeclaredVariable is not defined');
  });

  describe("getProperty method", () => {
    it("delegates to the base class's getProperty method by default", () => {
      let interpreterUndefined = interpreter.getProperty(interpreter.global, 'undefined');
      expect(Interpreter.prototype.getProperty).to.have.been.called;
      expect(interpreterUndefined).to.equal(interpreter.UNDEFINED);
    });
  });

  describe("hasProperty method", () => {
    let player;

    class Foo {
      constructor(name) {
        this.name = name;
      }
      whatsMyName() {
        return this.name;
      }
    }

    beforeEach(() => {
      // Set up a single sample case for all of the hasProperty tests.
      player = {};
      interpreter = new CustomMarshalingInterpreter('', new CustomMarshaler({
        globalProperties: {
          name: player, // meaning the 'name' property on the 'player' object
                        // goes into the global scope
          age: player   // also the 'age' property on the 'player' object
        },
        blockedProperties: ['name'],
        objectList: [{instance: Foo}],
      }));
    });

    it("delegates to the base class's hasProperty method by default", () => {
      const retVal = interpreter.hasProperty(interpreter.global, 'undefined');
      expect(retVal).to.be.true;
      expect(Interpreter.prototype.hasProperty).to.have.been.called;
    });

    it("does not find globals that don't exist", () => {
      expect(
          interpreter.hasProperty(interpreter.global, 'notAGlobalProperty')
      ).to.be.false;
    });

    it("finds custom-marshaled globals", () => {
      expect(
          interpreter.hasProperty(interpreter.global, 'age')
      ).to.be.true;
    });

    it("does not find blocked custom-marshaled globals", () => {
      expect(
          interpreter.hasProperty(interpreter.global, 'name')
      ).to.be.false;
    });

    it("finds properties on custom-marshaled objects", () => {
      const customMarshaledObject = interpreter.marshalNativeToInterpreter(new Foo("hello world"));
      expect(
          interpreter.hasProperty(customMarshaledObject, 'whatsMyName')
      ).to.be.true;
    });

    it("does not find properties that don't exist on custom-marshaled objects", () => {
      const customMarshaledObject = interpreter.marshalNativeToInterpreter(new Foo("hello world"));
      expect(
          interpreter.hasProperty(customMarshaledObject, 'notARealProperty')
      ).to.be.false;
    });

    it("does not find blocked properties on custom-marshaled objects", () => {
      const value = interpreter.marshalNativeToInterpreter(new Foo("hello world"));
      expect(
          interpreter.hasProperty(value, 'name')
      ).to.be.false;
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
      expect(CustomMarshalingInterpreter.evalWithEvents({}, {}).hooks).to.deep.equal([]);
    });

    it("will return the interpreter that was created to run the code", () => {
      expect(CustomMarshalingInterpreter.evalWithEvents({}, {}).interpreter).to.be.an.instanceOf(CustomMarshalingInterpreter);
    });

    describe("when given event handlers that accept arguments", () => {
      beforeEach(() => {
        hooks = CustomMarshalingInterpreter.evalWithEvents(
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
        hooks = CustomMarshalingInterpreter.evalWithEvents(
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
        hooks = CustomMarshalingInterpreter.evalWithEvents(
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
        expect(() => CustomMarshalingInterpreter.evalWithEvents(globals, {someEvent: {code: 'b()'}}, 'a()')).to.throw('Unexpected token');
      });
    });

    describe("when given a set of events handlers that call the provided global functions", () => {
      beforeEach(() => {
        hooks = CustomMarshalingInterpreter.evalWithEvents(
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

  describe("marshalNativeToInterpreter function", () => {
    let interpreter, value;
    beforeEach(() => {
      interpreter = new CustomMarshalingInterpreter(
        '',
        new CustomMarshaler({}),
        (interpreter, scope) => {
          interpreter.setProperty(
            scope,
            'assert',
            interpreter.createNativeFunction((truthy, message) => {
              if (truthy !== interpreter.TRUE) {
                throw new Error(message);
              }
            })
          );
        }
      );
      sinon.spy(interpreter, 'createPrimitive');
    });

    function boundMakeAssertableObj(nativeVar, nativeParentObj, maxDepth) {
      return makeAssertableObj(interpreter, nativeVar, nativeParentObj, maxDepth);
    }

    it("when given an undefined native variable, will return an undefined interpreter variable", () => {
      expect(interpreter.marshalNativeToInterpreter(undefined)).to.equal(interpreter.UNDEFINED);
    });

    it("will delegate to the interpreter's createPrimitive function for booleans, numbers, and strings", () => {
      interpreter.marshalNativeToInterpreter(true);
      expect(interpreter.createPrimitive).to.have.been.calledWith(true);
      interpreter.marshalNativeToInterpreter(5);
      expect(interpreter.createPrimitive).to.have.been.calledWith(5);
      interpreter.marshalNativeToInterpreter("some string");
      expect(interpreter.createPrimitive).to.have.been.calledWith("some string");
    });

    describe("when given an empty object to marshal, the corresponding interpreter object", () => {
      beforeEach(() => {
        value = boundMakeAssertableObj({});
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
        value = boundMakeAssertableObj({a: 1, b: true, c: "three"});
      });
      it("will be an object with those keys/values", () => {
        value.assert(`assert(value.a === 1)`);
        value.assert(`assert(value.b === true)`);
        value.assert(`assert(value.c === "three")`);
      });
    });

    describe("when given an object with more nested objects, the corresponding interpreter object", () => {
      beforeEach(() => {
        value = boundMakeAssertableObj({a: {b: {c: "three"}}});
      });
      it("will be an object with the same set of nested objects", () => {
        value.assert(`assert(value.a.b.c === "three")`);
      });
    });

    describe("when given a maxDepth parameter, the corresponding interpreter object", () => {
      let value0, value1, value2, value3, value4;
      beforeEach(() => {
        const nested = {level: 1, a: {level: 2, b: {level: 3, c: "three"}}};
        value0 = boundMakeAssertableObj(nested, null, 0);
        value1 = boundMakeAssertableObj(nested, null, 1);
        value2 = boundMakeAssertableObj(nested, null, 2);
        value3 = boundMakeAssertableObj(nested, null, 3);
        value4 = boundMakeAssertableObj(nested, null, 4);
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
        value = boundMakeAssertableObj(nested);
        value0 = boundMakeAssertableObj(nested, null, 0);
        value1 = boundMakeAssertableObj(nested, null, 1);
        value2 = boundMakeAssertableObj(nested, null, 2);
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
        expect(interpreter.marshalNativeToInterpreter(
          interpreterFunc,
        )).to.equal(interpreterFunc);
      });
    });

    describe("when given canvas image data (Uint8ClampedArray instances), the corresponding interpreter object", () => {
      beforeEach(() => {
        value = boundMakeAssertableObj(new Uint8ClampedArray(100));
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
        value = boundMakeAssertableObj(nativeFunc);
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

    describe("when given an object that should be custom marshaled", () => {
      beforeEach(() => {
        sinon.stub(interpreter.customMarshaler, 'shouldCustomMarshalObject').returns(true);
        sinon.stub(interpreter.customMarshaler, 'createCustomMarshalObject');
      });
      it("will delegate to the custom marshaler's createCustomMarshalObject", () => {
        const nativeParentObj = {foo: 'bar'};
        const nativeVar = nativeParentObj.foo;
        interpreter.marshalNativeToInterpreter(nativeVar, nativeParentObj);
        expect(interpreter.customMarshaler.createCustomMarshalObject).to.have.been.calledWith(nativeVar, nativeParentObj);
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
      CustomMarshalingInterpreter.evalWith('add(1,2)', options);
      expect(options.add).to.have.been.calledWith(1,2);
      CustomMarshalingInterpreter.evalWith('add(a,2)', options);
      expect(options.add).to.have.been.calledWith(3,2);
    });

    it("does not give the evaluated code access to native functions", () => {
      expect(() => CustomMarshalingInterpreter.evalWith('nativeAdd(1,2)', options)).to.throw('nativeAdd is not defined');
    });

    describe("when running with legacy=true", () => {

      it("the evaluated code will have access to 'native' functions", () => {
        expect(() => CustomMarshalingInterpreter.evalWith('nativeAdd(1,2)', options, {legacy: true})).not.to.throw;
        CustomMarshalingInterpreter.evalWith('nativeAdd(1,2)', options, {legacy: true});
        expect(window.nativeAdd).to.have.been.calledWith(1,2);
        CustomMarshalingInterpreter.evalWith('nativeAdd(1,2)', options, {legacy: true});
        expect(window.nativeAdd).to.have.been.calledWith(1,2);
      });

      it("the evaluated code will have access to functions passed in through options", () => {
        CustomMarshalingInterpreter.evalWith('add(1,2)', options, {legacy: true});
        expect(options.add).to.have.been.calledWith(1,2);
      });

      it("the evaluated code will have access to variables passed in through options", () => {
        CustomMarshalingInterpreter.evalWith('add(a,2)', options, {legacy: true});
        expect(options.add).to.have.been.calledWith(3,2);
        CustomMarshalingInterpreter.evalWith('nativeAdd(a,2)', options, {legacy: true});
        expect(window.nativeAdd).to.have.been.calledWith(3,2);
      });

    });
  });

  describe("marshalInterpreterToNative", () => {
    let interpreter;
    function evalExpression(expression) {
      interpreter = new CustomMarshalingInterpreter(
        `var result = ${expression};`,
        new CustomMarshaler({})
      );
      interpreter.run();
      return interpreter.marshalInterpreterToNative(interpreter.getValueFromScope('result'));
    }

    it("correctly marshals arrays", () => {
      expect(evalExpression(`["one", 2, ["three"]]`)).to.deep.equal(["one", 2, ["three"]]);
    });

    it("correctly marshals objects", () => {
      const value = evalExpression(`{one: 1, two: "two", three: {four: 4}}`);
      expect(value.one).to.equal(1);
      expect(value.two).to.equal("two");
      expect(value.three.four).to.equal(4);
      expect(Object.keys(value)).to.deep.equal(['one', 'two', 'three']);
      expect(value).to.deep.equal({one: 1, two: "two", three: {four: 4}});
    });

    it("marshals functions by delegating to CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction", () => {
      CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction = sinon.stub().returns('foo');
      expect(evalExpression(`function (a,b) { return a+b; }`)).to.equal('foo');
      expect(CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction).to.have.been.calledOnce;
      CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction = null;
    });

    it("marshals functions by doing nothing when CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction is not set", () => {
      expect(CustomMarshalingInterpreter.createNativeFunctionFromInterpreterFunction).to.be.null;
      expect(evalExpression(`function (a,b) { return a+b; }`))
        .to.equal(interpreter.getValueFromScope('result'));
    });

    it("throws an error if you try to give it something it does not understand", () => {
      const interpreter = new CustomMarshalingInterpreter(
        ``,
        new CustomMarshaler({})
      );
      expect(() => interpreter.marshalInterpreterToNative({notAnInterpreterObject: true}))
        .to.throw("Can't marshal type object");
    });
  });

  describe('makeNativeMemberFunction function', () => {
    let options, interpreter, result, isPaused;

    function testTheBasics() {
      it('will call the nativeFunc', () => {
        expect(options.nativeFunc).to.have.been.called;
      });
      it("will call the nativeFunc with the nativeParentObj as the 'this'", () => {
        expect(options.nativeFunc.thisValues[0]).to.equal(
          options.nativeParentObj
        );
      });
      it('will marshal the native return value back to an interpreter value', () => {
        expect(result).to.be.an.instanceOf(Interpreter.Primitive);
        expect(result.toNumber()).to.equal(6);
      });
    }

    function runWithOptions(code, getOpts) {
      beforeEach(() => {
        const opts = getOpts();
        interpreter = new CustomMarshalingInterpreter(
          code,
          new CustomMarshaler({}),
          (interpreter, scope) => {
            options = {...opts};
            const nativeFunc = interpreter.makeNativeMemberFunction(opts);
            interpreter.setProperty(
              scope,
              'memberFunc',
              opts.nativeIsAsync
              ? interpreter.createAsyncFunction(nativeFunc)
              : interpreter.createNativeFunction(nativeFunc)
            );
          }
        );
        isPaused = interpreter.run();
        result = interpreter.getProperty(interpreter.global, 'result');
      });
    }

    describe('when dontMarshal=true', () => {
      runWithOptions('var result = memberFunc(1,2,3)', () => ({
        dontMarshal: true,
        nativeFunc: sinon.stub().returns(6),
        nativeParentObj: {},
        maxDepth: 5,
      }));

      testTheBasics();

      it('will pass along the unmarshaled interpreter arguments to the nativeFunc', () => {
        const args = options.nativeFunc.firstCall.args;
        expect(args.length).to.equal(3);
        expect(args[0]).to.be.an.instanceOf(Interpreter.Primitive);
        expect(args[0].toNumber()).to.equal(1);
        expect(args[1].toNumber()).to.equal(2);
        expect(args[2].toNumber()).to.equal(3);
      });
    });

    describe('when dontMarshal=false', () => {
      runWithOptions('var result = memberFunc(1,2,3)', () => ({
        dontMarshal: false,
        nativeFunc: sinon.stub().returns(6),
        nativeParentObj: {},
        maxDepth: 5,
      }));
      testTheBasics();

      it('will pass along marshaled arguments to the nativeFunc', () => {
        const args = options.nativeFunc.firstCall.args;
        expect(args.length).to.equal(3);
        expect(args[0]).to.equal(1);
        expect(args[1]).to.equal(2);
        expect(args[2]).to.equal(3);
      });
    });

    describe('when dontMarshal=false and nativeIsAsync=true', () => {
      runWithOptions('var result = memberFunc(1,2)', () => ({
        dontMarshal: false,
        nativeFunc: sinon.stub().returns(6),
        nativeParentObj: {},
        maxDepth: 5,
        nativeIsAsync: true,
      }));

      it('will call the nativeFunc', () => {
        expect(options.nativeFunc).to.have.been.called;
      });
      it("will call the nativeFunc with the nativeParentObj as the 'this'", () => {
        expect(options.nativeFunc.thisValues[0]).to.equal(
          options.nativeParentObj
        );
      });
      it('will not return a result immediately, since the native function is asynchronous', () => {
        expect(result).to.equal(interpreter.UNDEFINED);
      });
      it('will pause the interpreter until the function is called', () => {
        expect(isPaused).to.be.true;
      });

      it('will automatically tack on an extra callback argument to be passed to the native func', () => {
        const args = options.nativeFunc.firstCall.args;
        expect(args.length).to.equal(3);
      });

      it('will pass along marshaled arguments to the nativeFunc', () => {
        const args = options.nativeFunc.firstCall.args;
        expect(args[0]).to.equal(1);
        expect(args[1]).to.equal(2);
      });

      it('will make the last marshaled argument a native callback function', () => {
        const args = options.nativeFunc.firstCall.args;
        expect(args[args.length - 1]).to.be.an.instanceOf(Function);
      });

      describe('when the native callback function is eventually called', () => {
        it('the result will be populated after the interpreter gets run again', (done) => {
          const args = options.nativeFunc.firstCall.args;
          window.setTimeout(() => {
            args[args.length - 1]('new value');
            result = interpreter.getProperty(interpreter.global, 'result');
            expect(result).to.equal(interpreter.UNDEFINED);

            isPaused = interpreter.run();
            expect(isPaused).to.be.false;
            result = interpreter.getProperty(interpreter.global, 'result');
            expect(result.toString()).to.equal("new value");
            done();
          }, 100);
        });
      });
    });

    describe('when dontMarshal=false and nativeCallsBackInterpreter=true', () => {
      runWithOptions(
        `
          var otherResult;
          var result = memberFunc(
            1,
            2,
            function(newResult, newOtherResult) {
              result = newResult;
              otherResult = newOtherResult;
            }
          )
        `,
        () => ({
          dontMarshal: false,
          nativeFunc: sinon.stub().returns(6),
          nativeParentObj: {},
          maxDepth: 5,
          nativeCallsBackInterpreter: true,
        })
      );

      testTheBasics();

      it('will pass along marshaled arguments to the nativeFunc', () => {
        const args = options.nativeFunc.firstCall.args;
        expect(args[0]).to.equal(1);
        expect(args[1]).to.equal(2);
      });

      it("will wrap any interpreter function arguments into a native function", () => {
        const args = options.nativeFunc.firstCall.args;
        expect(args[2]).to.be.an.instanceOf(Function);
      });

      describe("when the interpreter function passed to the native func is called", () => {
        let returnToInterpreter;
        beforeEach(() => {
          returnToInterpreter = options.nativeFunc.firstCall.args[2];
        });

        it("will call the interpreter function the next time the interpreter is run", () => {
          returnToInterpreter("a new result");
          result = interpreter.getProperty(interpreter.global, 'result');
          expect(result).to.be.an.instanceOf(Interpreter.Primitive);
          expect(result.toNumber()).to.equal(6);
          interpreter.run();
          result = interpreter.getProperty(interpreter.global, 'result');
          expect(result).to.be.an.instanceOf(Interpreter.Primitive);
          expect(result.toString()).to.equal("a new result");
        });

        it("will marshal all the arguments that were passed", () => {
          returnToInterpreter("a new result", "another result");
          interpreter.run();
          result = interpreter.getProperty(interpreter.global, 'result');
          expect(result).to.be.an.instanceOf(Interpreter.Primitive);
          expect(result.toString()).to.equal("a new result");
          result = interpreter.getProperty(interpreter.global, 'otherResult');
          expect(result).to.be.an.instanceOf(Interpreter.Primitive);
          expect(result.toString()).to.equal("another result");
        });

        it("will marshall no arguments if none were passed", () => {
          returnToInterpreter();
          interpreter.run();
          result = interpreter.getProperty(interpreter.global, 'result');
          expect(result).to.equal(interpreter.UNDEFINED);
        });
      });
    });

  });

});
