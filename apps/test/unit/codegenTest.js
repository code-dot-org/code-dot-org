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
