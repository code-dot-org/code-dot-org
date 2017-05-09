import sinon from 'sinon';
import {assert, expect} from '../util/configuredChai';
import * as codegen from '@cdo/apps/codegen';

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
