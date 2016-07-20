import {assert} from '../../util/configuredChai';
var testUtils = require('../../util/testUtils');
testUtils.setupLocales();
testUtils.setExternalGlobals();

var setPropertyDropdown = require('@cdo/apps/applab/setPropertyDropdown');

describe("setPropertyDropdown", function () {
  var stripQuotes = setPropertyDropdown.__TestInterface.stripQuotes;
  var getDropdownProperties = setPropertyDropdown.__TestInterface.getDropdownProperties;

  it('stripQuotes', function () {
    assert.equal(stripQuotes('"double"'), 'double');
    assert.equal(stripQuotes("'single'"), 'single');
    assert.equal(stripQuotes("noquotes"), 'noquotes');
    assert.equal(stripQuotes('"mismatched\''), '"mismatched\'');
  });

  it('getInternalPropertyInfo', function () {
    var info;

    // Check that internal picture property can be accessed either by .image or .picture
    info = setPropertyDropdown.getInternalPropertyInfo({ tagName: 'img' }, 'image');
    assert.equal(info.internalName, 'picture');

    info = setPropertyDropdown.getInternalPropertyInfo({ tagName: 'img' }, 'picture');
    assert.equal(info.internalName, 'picture');

    info = setPropertyDropdown.getInternalPropertyInfo({ tagName: 'img' }, 'unknown');
    assert.isUndefined(info);
  });

  it('getDropdownProperties', function () {
    var list;

    // image elements should have .image but not .picture
    list = getDropdownProperties('IMAGE');
    assert.notEqual(list.indexOf('"image"'), -1);
    assert.equal(list.indexOf('"picture"'), -1);

    list = getDropdownProperties('UNKNOWN');
    // Test two very different properties as a proxy for all properties.
    assert.notEqual(list.indexOf('"group-id"'), -1);
    assert.notEqual(list.indexOf('"background-color"'), -1);

    list = getDropdownProperties();
    // Test two very different properties as a proxy for all properties.
    assert.notEqual(list.indexOf('"group-id"'), list.join());
    assert.notEqual(list.indexOf('"background-color"'), -1);
  });
});
