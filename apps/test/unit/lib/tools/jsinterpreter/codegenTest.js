import sinon from 'sinon';
import Interpreter from '@code-dot-org/js-interpreter';
import {assert, expect} from '../../../../util/configuredChai';
import * as codegen from '@cdo/apps/lib/tools/jsinterpreter/codegen';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import CustomMarshaler from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshaler';

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

  describe('makeNativeMemberFunction function', () => {
    let options, interpreter, result, isPaused;

    it('returns a function', () => {
      expect(codegen.makeNativeMemberFunction({})).to.be.an.instanceOf(
        Function
      );
    });

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
            options = {...opts, interpreter};
            const nativeFunc = codegen.makeNativeMemberFunction(options);
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
        result = interpreter.getProperty(interpreter.globalScope, 'result');
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
            result = interpreter.getProperty(interpreter.globalScope, 'result');
            expect(result).to.equal(interpreter.UNDEFINED);

            isPaused = interpreter.run();
            expect(isPaused).to.be.false;
            result = interpreter.getProperty(interpreter.globalScope, 'result');
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
          result = interpreter.getProperty(interpreter.globalScope, 'result');
          expect(result).to.be.an.instanceOf(Interpreter.Primitive);
          expect(result.toNumber()).to.equal(6);
          interpreter.run();
          result = interpreter.getProperty(interpreter.globalScope, 'result');
          expect(result).to.be.an.instanceOf(Interpreter.Primitive);
          expect(result.toString()).to.equal("a new result");
        });

        it("will marshal all the arguments that were passed", () => {
          returnToInterpreter("a new result", "another result");
          interpreter.run();
          result = interpreter.getProperty(interpreter.globalScope, 'result');
          expect(result).to.be.an.instanceOf(Interpreter.Primitive);
          expect(result.toString()).to.equal("a new result");
          result = interpreter.getProperty(interpreter.globalScope, 'otherResult');
          expect(result).to.be.an.instanceOf(Interpreter.Primitive);
          expect(result.toString()).to.equal("another result");
        });

        it("will marshall no arguments if none were passed", () => {
          returnToInterpreter();
          interpreter.run();
          result = interpreter.getProperty(interpreter.globalScope, 'result');
          expect(result).to.equal(interpreter.UNDEFINED);
        });
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
      codegen.evalWith('add(1,2)', options);
      expect(options.add).to.have.been.calledWith(1,2);
      codegen.evalWith('add(a,2)', options);
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
