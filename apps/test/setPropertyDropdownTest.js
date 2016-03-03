var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

window.React = require('react');
window.jQuery = require('jquery');
testUtils.setupLocales();

var setPropertyDropdown = require('@cdo/apps/applab/setPropertyDropdown');

describe("setPropertyDropdown", function () {
  var getFirstSetPropertyParamFromCode = setPropertyDropdown.__TestInterface.getFirstSetPropertyParamFromCode;

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
});
