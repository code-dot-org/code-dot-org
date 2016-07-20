import {assert} from '../util/configuredChai';
var testUtils = require('./../util/testUtils');
testUtils.setupLocalesDEPRECATED();

var errorMapper = require('@cdo/apps/acemode/errorMapper');

describe('errorMapper correctly maps different errors', function () {
  it('defined but never used', function () {
    var jslintResults = {
      data: [{
        column: 5,
        raw: "'{a}' is defined but never used.",
        row: 0,
        text: "'x' is defined but never used.",
        type: "info"
      }]
    };

    errorMapper.processResults(jslintResults);

    assert.equal(jslintResults.data[0].text,
      "'x' is defined, but it's not called in your program.");
  });

  it('assignment in conditional expression', function () {
    var jslintResults = {
      data: [{
        column: 9,
        raw: "Assignment in conditional expression",
        row: 0,
        text: "Assignment in conditional expression",
        type: "warning"
      }]
    };

    errorMapper.processResults(jslintResults);

    assert.equal(jslintResults.data[0].text,
      "For conditionals, use the comparison operator (===) to check if two things are equal.");
  });

  it('not defined', function () {
    var jslintResults = {
      data: [{
        column: 0,
        raw: "'{a}' is not defined.",
        row: 0,
        text: "'x' is not defined.",
        type: "warning"
      }]
    };

    errorMapper.processResults(jslintResults);

    assert.equal(jslintResults.data[0].text,
      "'x' hasn't been declared yet.");
  });
});
