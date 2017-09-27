import {assert} from '../../util/configuredChai';
var testUtils = require('../../util/testUtils');

var setPropertyDropdown = require('@cdo/apps/applab/setPropertyDropdown');

describe("setPropertyDropdown", function () {
  var stripQuotes = setPropertyDropdown.__TestInterface.stripQuotes;
  var getDropdownProperties = setPropertyDropdown.__TestInterface.getDropdownProperties;
  var getPropertyValueDropdown = setPropertyDropdown.__TestInterface.getPropertyValueDropdown;

  testUtils.setExternalGlobals();

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

  it('getPropertyValueDropdown', function () {
    // given all of the property types for a generic unknown element:
    let list = getDropdownProperties('UNKNOWN');
    for (var property of list) {
      // Verify that getPropertyValueDropdown() returns a function for
      // 'image' or 'picture', and a non-empty array for all other types
      let result = getPropertyValueDropdown(property);
      assert.notEqual(result, undefined);
      if (property === 'image' || property === 'picture') {
        assert.isTrue(typeof result === 'function', 'result is a function');
      } else {
        assert.isTrue(result instanceof Array, 'result is an array');
        assert.isFalse(result.length === 0, 'array is not empty');
      }
    }
  });
});
