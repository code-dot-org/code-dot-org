import {assert} from '../util/deprecatedChai';

var errorMapper = require('@cdo/apps/acemode/errorMapper');

describe('errorMapper correctly maps different errors', function() {
  it('defined but never used', function() {
    var jslintResults = {
      data: [
        {
          column: 5,
          raw: "'{a}' is defined but never used.",
          row: 0,
          text: "'x' is defined but never used.",
          type: 'info'
        }
      ]
    };

    errorMapper.processResults(jslintResults);

    assert.equal(
      jslintResults.data[0].text,
      "'x' is defined, but it's not called in your program."
    );
  });

  it('assignment in conditional expression', function() {
    var jslintResults = {
      data: [
        {
          column: 9,
          raw: 'Assignment in conditional expression',
          row: 0,
          text: 'Assignment in conditional expression',
          type: 'warning'
        }
      ]
    };

    errorMapper.processResults(jslintResults);

    assert.equal(
      jslintResults.data[0].text,
      'For conditionals, use the comparison operator (===) to check if two things are equal.'
    );
  });

  it('not defined', function() {
    var jslintResults = {
      data: [
        {
          column: 0,
          raw: "'{a}' is not defined.",
          row: 0,
          text: "'x' is not defined.",
          type: 'warning'
        }
      ]
    };

    errorMapper.processResults(jslintResults);

    assert.equal(jslintResults.data[0].text, "'x' hasn't been declared yet.");
  });

  it('reserved words (App lab)', function() {
    var jslintResults = {
      data: [
        {
          column: 0,
          raw:
            "Expected an identifier and instead saw '{a}' (a reserved word).",
          row: 0,
          text: "Expected an identifier and instead saw 'x' (a reserved word).",
          type: 'error'
        }
      ]
    };

    errorMapper.processResults(jslintResults, 'Applab');
    assert.equal(
      jslintResults.data[0].text,
      "'x' is a reserved word in App Lab. Use a different variable name."
    );
  });

  it('reserved words (Game lab)', function() {
    var jslintResults = {
      data: [
        {
          column: 0,
          raw:
            "Expected an identifier and instead saw '{a}' (a reserved word).",
          row: 0,
          text: "Expected an identifier and instead saw 'x' (a reserved word).",
          type: 'error'
        }
      ]
    };

    errorMapper.processResults(jslintResults, 'Gamelab');
    assert.equal(
      jslintResults.data[0].text,
      "'x' is a reserved word in Game Lab. Use a different variable name."
    );
  });

  it('redefining setup', function() {
    var jslintResults = {
      data: [
        {
          column: 0,
          raw: "'{a}' is defined but never used.",
          row: 0,
          text: "'setup' is defined but never used.",
          type: 'error'
        }
      ]
    };

    errorMapper.processResults(jslintResults, 'Gamelab');
    assert.equal(
      jslintResults.data[0].text,
      "'setup' is a function that already exists in Game Lab. Consider giving this function a different name."
    );
  });
});
