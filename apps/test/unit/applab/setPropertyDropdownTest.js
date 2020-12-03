import {assert} from '../../util/deprecatedChai';
import photoSelect from '@cdo/apps/applab/designElements/photoSelect';
var testUtils = require('../../util/testUtils');

var setPropertyDropdown = require('@cdo/apps/applab/setPropertyDropdown');

describe('setPropertyDropdown', function() {
  var stripQuotes = setPropertyDropdown.__TestInterface.stripQuotes;
  var getDropdownProperties =
    setPropertyDropdown.__TestInterface.getDropdownProperties;
  var getPropertyValueDropdown =
    setPropertyDropdown.__TestInterface.getPropertyValueDropdown;

  testUtils.setExternalGlobals();

  it('stripQuotes', function() {
    assert.equal(stripQuotes('"double"'), 'double');
    assert.equal(stripQuotes("'single'"), 'single');
    assert.equal(stripQuotes('noquotes'), 'noquotes');
    assert.equal(stripQuotes('"mismatched\''), '"mismatched\'');
  });

  it('getInternalPropertyInfo', function() {
    var info;

    // Check that internal picture property can be accessed either by .image or .picture
    info = setPropertyDropdown.getInternalPropertyInfo(
      {tagName: 'img'},
      'image'
    );
    assert.equal(info.internalName, 'picture');

    info = setPropertyDropdown.getInternalPropertyInfo(
      {tagName: 'img'},
      'picture'
    );
    assert.equal(info.internalName, 'picture');

    // Check that icon-color maps to internal property textColor for photo select elements only
    const photoSelectElement = photoSelect.create();
    info = setPropertyDropdown.getInternalPropertyInfo(
      photoSelectElement,
      'icon-color'
    );
    assert.equal(info.internalName, 'textColor');

    info = setPropertyDropdown.getInternalPropertyInfo(
      {tagName: 'img'},
      'icon-color'
    );
    assert.equal(info.internalName, 'icon-color');

    info = setPropertyDropdown.getInternalPropertyInfo(
      {tagName: 'img'},
      'unknown'
    );
    assert.isUndefined(info);
  });

  it('getDropdownProperties', function() {
    var list;

    // image elements should have .image but not .picture
    list = getDropdownProperties(true, 'IMAGE');
    var foundImage = false;
    for (let item of list) {
      assert(typeof item === 'object');
      assert(item.text !== '"picture"');
      foundImage = foundImage || item.text === '"image"';
      var clickResult;
      item.click(text => {
        clickResult = text;
      });
      assert.equal(clickResult, item.display);
    }
    assert(foundImage);

    list = getDropdownProperties(true, 'UNKNOWN');
    // Test two very different properties as a proxy for all properties.
    var foundGroupId = false,
      foundBackgroundColor = false;
    for (let item of list) {
      assert(typeof item === 'object');
      foundGroupId = foundGroupId || item.text === '"group-id"';
      foundBackgroundColor =
        foundBackgroundColor || item.text === '"background-color"';
      item.click(text => {
        clickResult = text;
      });
      assert.equal(clickResult, item.display);
    }
    assert(foundGroupId);
    assert(foundBackgroundColor);

    list = getDropdownProperties(true);
    // Test two very different properties as a proxy for all properties.
    (foundGroupId = false), (foundBackgroundColor = false);
    for (let item of list) {
      assert(typeof item === 'object');
      foundGroupId = foundGroupId || item.text === '"group-id"';
      foundBackgroundColor =
        foundBackgroundColor || item.text === '"background-color"';
      item.click(text => {
        clickResult = text;
      });
      assert.equal(clickResult, item.display);
    }
    assert(foundGroupId);
    assert(foundBackgroundColor);
  });

  it('getPropertyValueDropdown', function() {
    // given all of the property types for a generic unknown element:
    let list = getDropdownProperties(false, 'UNKNOWN');
    for (let object of list) {
      let property = object.text;
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
