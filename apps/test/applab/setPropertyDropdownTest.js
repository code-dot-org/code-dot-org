var testUtils = require('../util/testUtils');
var assert = testUtils.assert;

testUtils.setupLocales();
testUtils.setExternalGlobals();

var setPropertyDropdown = require('@cdo/apps/applab/setPropertyDropdown');

describe("setPropertyDropdown", function () {
  var getFirstSetPropertyParamFromCode = setPropertyDropdown.__TestInterface.getFirstSetPropertyParamFromCode;
  var stripQuotes = setPropertyDropdown.__TestInterface.stripQuotes;

  it("getFirstSetPropertyParamFromCode", function () {
    var code;

    // single quotes
    code = "setProperty('element1', ";
    assert.equal(getFirstSetPropertyParamFromCode(code), 'element1');

    // double quotes
    code = 'setProperty("element1", ';
    assert.equal(getFirstSetPropertyParamFromCode(code), 'element1');

    // mix quotes
    code = 'setProperty("element1\', ';
    assert.equal(getFirstSetPropertyParamFromCode(code), null);

    // no trailing space
    code = "setProperty('element1',";
    assert.equal(getFirstSetPropertyParamFromCode(code), 'element1');

    // multiple setProperty
    code = "setProperty('element1', 'width', 100); setProperty('element2', ";
    assert.equal(getFirstSetPropertyParamFromCode(code), 'element2');
  });

  it('stripQuotes', function () {
    assert.equal(stripQuotes('"double"'), 'double');
    assert.equal(stripQuotes("'single'"), 'single');
    assert.equal(stripQuotes("noquotes"), 'noquotes');
    assert.equal(stripQuotes('"mismatched\''), '"mismatched\'');
  });
});
