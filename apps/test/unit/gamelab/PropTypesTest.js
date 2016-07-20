import {expect} from '../../util/configuredChai';
import {throwIfSerializedAnimationListIsInvalid} from '@cdo/apps/gamelab/PropTypes';

var testUtils = require('../../util/testUtils');
testUtils.setExternalGlobals();

describe('throwIfSerializedAnimationListIsInvalid', function () {
  it('does not throw on minimum valid SerializedAnimationList', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: [],
      propsByKey: {}
    })).not.to.throw();
  });

  it('throws if passed anything falsy', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid(undefined)).to.throw(Error,
        'Required prop `serializedAnimationList` was not specified in `Animation List JSON`.');
    expect(() => throwIfSerializedAnimationListIsInvalid(null)).to.throw(Error,
        'Required prop `serializedAnimationList` was not specified in `Animation List JSON`.');
    expect(() => throwIfSerializedAnimationListIsInvalid(false)).to.throw(Error,
        'Invalid prop `serializedAnimationList` of type `boolean` supplied to `Animation List JSON`, expected `object`.');
  });

  it('throws if missing orderedKeys or propsByKey', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid({})).to.throw(Error,
        'Required prop `serializedAnimationList.orderedKeys` was not specified in `Animation List JSON`.');
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: []
    })).to.throw(Error,
        'Required prop `serializedAnimationList.propsByKey` was not specified in `Animation List JSON`.');
    expect(() => throwIfSerializedAnimationListIsInvalid({
      propsByKey: {}
    })).to.throw(Error,
        'Required prop `serializedAnimationList.orderedKeys` was not specified in `Animation List JSON`.');
  });

  it('throws if orderedKeys is not an array', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: {},
      propsByKey: {}
    })).to.throw(Error,
        'Invalid prop `serializedAnimationList.orderedKeys` of type `object` supplied to `Animation List JSON`, expected an array.');
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: "",
      propsByKey: {}
    })).to.throw(Error,
        'Invalid prop `serializedAnimationList.orderedKeys` of type `string` supplied to `Animation List JSON`, expected an array.');
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: null,
      propsByKey: {}
    })).to.throw(Error,
        'Required prop `serializedAnimationList.orderedKeys` was not specified in `Animation List JSON`.');
  });

  it('throws if duplicates are found in the orderedKeys array', function () {
    const validKeys = ['this', 'is', 'valid'];
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: validKeys,
      propsByKey: buildValidPropsForKeys(validKeys)
    })).not.to.throw();

    const invalidKeys = ['this', 'is', 'is', 'not'];
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: invalidKeys,
      propsByKey: buildValidPropsForKeys(invalidKeys)
    })).to.throw(Error,
        'Key "is" appears more than once in orderedKeys');
  });

  it('throws if it finds keys without associated props', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: ['keyWithoutProps'],
      propsByKey: {}
    })).to.throw(Error,
        'Animation List has key "keyWithoutProps" but not associated props');
  });

  it('throws if it finds props without associated key', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: [],
      propsByKey: buildValidPropsForKeys(['propsWithoutKey'])
    })).to.throw(Error,
        'Animation List has a props for "propsWithoutKey" but that key isn\'t in the orderedKeys list');
  });

  it('throws if required prop fields are missing', function () {
    const requiredFields = ['name', 'frameSize', 'frameCount', 'frameRate'];
    requiredFields.forEach(requiredField => {
      const keys = ['mykey'];
      let props = buildValidPropsForKeys(keys);
      keys.forEach(k => delete props[k][requiredField]);
      expect(() => throwIfSerializedAnimationListIsInvalid({
        orderedKeys: keys,
        propsByKey: props
      })).to.throw(Error,
          'Required prop `serializedAnimationList.propsByKey.mykey.' +
          requiredField +
          '` was not specified in `Animation List JSON`.');
    });
  });

  it('throws if a name is used twice in props', function () {
    const keys = ['one', 'two'];
    let props = buildValidPropsForKeys(keys);
    keys.forEach(k => props[k].name = 'duplicate');
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: keys,
      propsByKey: props
    })).to.throw(Error,
        'Name "duplicate" appears more than once in propsByKey');
  });

  it('does not throw if it finds an unexpected property', function () {
    const keys = ['mykey'];
    let props = buildValidPropsForKeys(keys);
    props['mykey'].extraStuff = 'here is something else';
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: keys,
      propsByKey: props,
      somethingElse: {}
    })).not.to.throw();
  });
});

function buildValidPropsForKeys(keys) {
  return keys.reduce((memo, next) => {
    memo[next] = {name: next, sourceSize: {x: 0, y: 0}, frameSize: {x: 0, y: 0}, frameCount: 0, frameRate: 0};
    return memo;
  }, {});
}
