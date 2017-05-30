import sinon from 'sinon';
import Interpreter from '@code-dot-org/js-interpreter';
import {expect} from '../../../../util/configuredChai';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import CustomMarshaler from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshaler';
import * as codegen from '@cdo/apps/codegen';
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
      nativeValue.draw = function (){
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
        interpreter.globalScope,
        'foo',
        interpreter.TRUE
      );
      expect(Interpreter.prototype.setProperty).to.have.been.calledWith(
        interpreter.getProperty(interpreter.globalScope, 'foo'),
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
          interpreter.globalScope,
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
            interpreter.globalScope,
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
    expect(interpreter.getProperty(interpreter.globalScope, 'name').toString()).to.equal("Paul");
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
    expect(() => interpreter.run()).to.throw('Unknown identifier: someUndeclaredVariable');
  });

  describe("getProperty method", () => {
    it("delegates to the base class's getProperty method by default", () => {
      let interpreterUndefined = interpreter.getProperty(interpreter.globalScope, 'undefined');
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
      const retVal = interpreter.hasProperty(interpreter.globalScope, 'undefined');
      expect(retVal).to.be.true;
      expect(Interpreter.prototype.hasProperty).to.have.been.called;
    });

    it("does not find globals that don't exist", () => {
      expect(
          interpreter.hasProperty(interpreter.globalScope, 'notAGlobalProperty')
      ).to.be.false;
    });

    it("finds custom-marshaled globals", () => {
      expect(
          interpreter.hasProperty(interpreter.globalScope, 'age')
      ).to.be.true;
    });

    it("does not find blocked custom-marshaled globals", () => {
      expect(
          interpreter.hasProperty(interpreter.globalScope, 'name')
      ).to.be.false;
    });

    it("finds properties on custom-marshaled objects", () => {
      const customMarshaledObject = codegen.marshalNativeToInterpreter(interpreter, new Foo("hello world"));
      expect(
          interpreter.hasProperty(customMarshaledObject, 'whatsMyName')
      ).to.be.true;
    });

    it("does not find properties that don't exist on custom-marshaled objects", () => {
      const customMarshaledObject = codegen.marshalNativeToInterpreter(interpreter, new Foo("hello world"));
      expect(
          interpreter.hasProperty(customMarshaledObject, 'notARealProperty')
      ).to.be.false;
    });

    it("does not find blocked properties on custom-marshaled objects", () => {
      const value = codegen.marshalNativeToInterpreter(interpreter, new Foo("hello world"));
      expect(
          interpreter.hasProperty(value, 'name')
      ).to.be.false;
    });
  });
});
