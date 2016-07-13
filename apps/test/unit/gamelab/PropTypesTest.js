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
    expect(() => throwIfSerializedAnimationListIsInvalid(undefined)).to.throw(Error);
    expect(() => throwIfSerializedAnimationListIsInvalid(null)).to.throw(Error);
    expect(() => throwIfSerializedAnimationListIsInvalid(false)).to.throw(Error);
  });

  it('throws if missing orderedKeys or propsByKey', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid({})).to.throw(Error);
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: []
    })).to.throw(Error);
    expect(() => throwIfSerializedAnimationListIsInvalid({
      propsByKey: {}
    })).to.throw(Error);
  });

  it('throws if orderedKeys is not an array', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: {},
      propsByKey: {}
    })).to.throw(Error);
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: "",
      propsByKey: {}
    })).to.throw(Error);
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: null,
      propsByKey: {}
    })).to.throw(Error);
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
    })).to.throw(Error);
  });

  it('throws if it finds keys without associated props', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: ['keyWithoutProps'],
      propsByKey: {}
    })).to.throw(Error);
  });

  it('throws if it finds props without associated key', function () {
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: [],
      propsByKey: buildValidPropsForKeys(['propsWithoutKey'])
    })).to.throw(Error);
  });

  it('throws if required prop fields are missing', function () {
    const requiredFields = ['name', 'sourceSize', 'frameSize', 'frameCount', 'frameRate'];
    requiredFields.forEach(requiredField => {
      const keys = ['mykey'];
      let props = buildValidPropsForKeys(keys);
      keys.forEach(k => delete props[k][requiredField]);
      expect(() => throwIfSerializedAnimationListIsInvalid({
        orderedKeys: keys,
        propsByKey: props
      })).to.throw(Error);
    });
  });

  it('throws if a name is used twice in props', function () {
    const keys = ['one', 'two'];
    let props = buildValidPropsForKeys(keys);
    keys.forEach(k => props[k].name = 'duplicate');
    expect(() => throwIfSerializedAnimationListIsInvalid({
      orderedKeys: keys,
      propsByKey: props
    })).to.throw(Error);
  });
});

function buildValidPropsForKeys(keys) {
  return keys.reduce((memo, next) => {
    memo[next] = {name: next, sourceSize: {x: 0, y: 0}, frameSize: {x: 0, y: 0}, frameCount: 0, frameRate: 0};
    return memo;
  }, {});
}
