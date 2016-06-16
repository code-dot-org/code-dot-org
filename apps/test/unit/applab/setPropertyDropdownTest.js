import {assert} from '../../util/configuredChai';
var testUtils = require('../../util/testUtils');
testUtils.setupLocales();
testUtils.setExternalGlobals();

var setPropertyDropdown = require('@cdo/apps/applab/setPropertyDropdown');

describe("setPropertyDropdown", function () {
  var stripQuotes = setPropertyDropdown.__TestInterface.stripQuotes;

  it('stripQuotes', function () {
    assert.equal(stripQuotes('"double"'), 'double');
    assert.equal(stripQuotes("'single'"), 'single');
    assert.equal(stripQuotes("noquotes"), 'noquotes');
    assert.equal(stripQuotes('"mismatched\''), '"mismatched\'');
  });
});
