import photoSelect from '@cdo/apps/applab/designElements/photoSelect';

var setPropertyDropdown = require('@cdo/apps/applab/setPropertyDropdown');

var testUtils = require('../../util/testUtils');

describe('setPropertyDropdown', function () {
  var stripQuotes = setPropertyDropdown.__TestInterface.stripQuotes;
  var getDropdownProperties =
    setPropertyDropdown.__TestInterface.getDropdownProperties;
  var getPropertyValueDropdown =
    setPropertyDropdown.__TestInterface.getPropertyValueDropdown;

  testUtils.setExternalGlobals();

  it('stripQuotes', function () {
    expect(stripQuotes('"double"')).toEqual('double');
    expect(stripQuotes("'single'")).toEqual('single');
    expect(stripQuotes('noquotes')).toEqual('noquotes');
    expect(stripQuotes('"mismatched\'')).toEqual('"mismatched\'');
  });

  it('getInternalPropertyInfo', function () {
    var info;

    // Check that internal picture property can be accessed either by .image or .picture
    info = setPropertyDropdown.getInternalPropertyInfo(
      {tagName: 'img'},
      'image'
    );
    expect(info.internalName).toEqual('picture');

    info = setPropertyDropdown.getInternalPropertyInfo(
      {tagName: 'img'},
      'picture'
    );
    expect(info.internalName).toEqual('picture');

    // Check that icon-color maps to internal property textColor for photo select elements only
    const photoSelectElement = photoSelect.create();
    info = setPropertyDropdown.getInternalPropertyInfo(
      photoSelectElement,
      'icon-color'
    );
    expect(info.internalName).toEqual('textColor');

    info = setPropertyDropdown.getInternalPropertyInfo(
      {tagName: 'img'},
      'icon-color'
    );
    expect(info.internalName).toEqual('icon-color');

    info = setPropertyDropdown.getInternalPropertyInfo(
      {tagName: 'img'},
      'unknown'
    );
    expect(info).not.toBeDefined();
  });

  it('getDropdownProperties', function () {
    var list;

    // image elements should have .image but not .picture
    list = getDropdownProperties(true, 'IMAGE');
    var foundImage = false;
    for (let item of list) {
      expect(typeof item === 'object').toBeTruthy();
      expect(item.text !== '"picture"').toBeTruthy();
      foundImage = foundImage || item.text === '"image"';
      var clickResult;
      item.click(text => {
        clickResult = text;
      });
      expect(clickResult).toEqual(item.display);
    }
    expect(foundImage).toBeTruthy();

    list = getDropdownProperties(true, 'UNKNOWN');
    // Test two very different properties as a proxy for all properties.
    var foundGroupId = false,
      foundBackgroundColor = false;
    for (let item of list) {
      expect(typeof item === 'object').toBeTruthy();
      foundGroupId = foundGroupId || item.text === '"group-id"';
      foundBackgroundColor =
        foundBackgroundColor || item.text === '"background-color"';
      item.click(text => {
        clickResult = text;
      });
      expect(clickResult).toEqual(item.display);
    }
    expect(foundGroupId).toBeTruthy();
    expect(foundBackgroundColor).toBeTruthy();

    list = getDropdownProperties(true);
    // Test two very different properties as a proxy for all properties.
    (foundGroupId = false), (foundBackgroundColor = false);
    for (let item of list) {
      expect(typeof item === 'object').toBeTruthy();
      foundGroupId = foundGroupId || item.text === '"group-id"';
      foundBackgroundColor =
        foundBackgroundColor || item.text === '"background-color"';
      item.click(text => {
        clickResult = text;
      });
      expect(clickResult).toEqual(item.display);
    }
    expect(foundGroupId).toBeTruthy();
    expect(foundBackgroundColor).toBeTruthy();
  });

  it('getPropertyValueDropdown', function () {
    // given all of the property types for a generic unknown element:
    let list = getDropdownProperties(false, 'UNKNOWN');
    for (let object of list) {
      let property = object.text;
      // Verify that getPropertyValueDropdown() returns a function for
      // 'image' or 'picture', and a non-empty array for all other types
      let result = getPropertyValueDropdown(property);
      expect(result).not.toEqual(undefined);
      if (property === 'image' || property === 'picture') {
        expect(typeof result === 'function').toBe(true);
      } else {
        expect(result instanceof Array).toBe(true);
        expect(result.length === 0).toBe(false);
      }
    }
  });
});
