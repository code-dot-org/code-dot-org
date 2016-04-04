var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
var codegen = require('@cdo/apps/codegen');

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

});
