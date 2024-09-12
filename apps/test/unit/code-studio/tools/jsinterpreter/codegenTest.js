import * as codegen from '@cdo/apps/code-studio/jsinterpreter/codegen';

describe('codegen', function () {
  describe('generates cumulative length stats', function () {
    it('one line', function () {
      expect([0, 2]).toEqual(codegen.calculateCumulativeLength('z'));
    });
    it('LF', function () {
      expect([0, 3, 8, 14, 15]).toEqual(
        codegen.calculateCumulativeLength('1;\n234;\n5678;\n')
      );
    });
    it('CRLF', function () {
      expect([0, 4, 10, 16]).toEqual(
        codegen.calculateCumulativeLength('1;\r\n234;\r\n5678;')
      );
    });
    it('mixed CRLF and LF', function () {
      expect([0, 17, 34, 36]).toEqual(
        codegen.calculateCumulativeLength(
          'while (false) {\r\n  doSomething();\n}'
        )
      );
    });
    it('with some lines empty', function () {
      expect([0, 3, 4, 6, 9, 10, 11]).toEqual(
        codegen.calculateCumulativeLength('1;\n\n\r\n2;\n\n')
      );
    });
  });
});
