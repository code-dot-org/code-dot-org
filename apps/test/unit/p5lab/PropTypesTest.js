import {expect} from '../../util/deprecatedChai';
import {throwIfSerializedAnimationListIsInvalid} from '@cdo/apps/p5lab/shapes';

var testUtils = require('../../util/testUtils');

describe('throwIfSerializedAnimationListIsInvalid', function() {
  testUtils.setExternalGlobals();

  it('does not throw on minimum valid SerializedAnimationList', function() {
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        orderedKeys: [],
        propsByKey: {}
      })
    ).not.to.throw();
  });

  it('throws if passed anything empty', function() {
    expect(() => throwIfSerializedAnimationListIsInvalid(undefined)).to.throw(
      Error,
      `serializedAnimationList is not an object`
    );
    expect(() => throwIfSerializedAnimationListIsInvalid(null)).to.throw(
      Error,
      `serializedAnimationList is not an object`
    );
  });

  it('throws if missing orderedKeys or propsByKey', function() {
    expect(() => throwIfSerializedAnimationListIsInvalid({})).to.throw(
      Error,
      `orderedKeys is not an array`
    );
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        orderedKeys: []
      })
    ).to.throw(Error, `propsByKey is not an object`);
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        propsByKey: {}
      })
    ).to.throw(Error, `orderedKeys is not an array`);
  });

  it('throws if orderedKeys is not an array', function() {
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        orderedKeys: {},
        propsByKey: {}
      })
    ).to.throw(Error, `orderedKeys is not an array`);
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        orderedKeys: '',
        propsByKey: {}
      })
    ).to.throw(Error, `orderedKeys is not an array`);
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        orderedKeys: null,
        propsByKey: {}
      })
    ).to.throw(Error, `orderedKeys is not an array`);
  });

  it('throws if it finds keys without associated props', function() {
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        orderedKeys: ['keyWithoutProps'],
        propsByKey: {}
      })
    ).to.throw(
      Error,
      'Animation List has key "keyWithoutProps" but not associated props'
    );
  });

  it('throws if it finds props without associated key', function() {
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        orderedKeys: [],
        propsByKey: buildValidPropsForKeys(['propsWithoutKey'])
      })
    ).to.throw(
      Error,
      'Animation List has a props for "propsWithoutKey" but that key isn\'t in the orderedKeys list'
    );
  });

  it('throws if required prop fields are missing', function() {
    const requiredFields = [
      'name',
      'frameSize',
      'frameCount',
      'looping',
      'frameDelay'
    ];
    requiredFields.forEach(requiredField => {
      const keys = ['mykey'];
      let props = buildValidPropsForKeys(keys);
      keys.forEach(k => delete props[k][requiredField]);
      expect(() =>
        throwIfSerializedAnimationListIsInvalid({
          orderedKeys: keys,
          propsByKey: props
        })
      ).to.throw(
        Error,
        `Required prop '${requiredField}' is missing from animation with key 'mykey'.`
      );
    });
  });

  it('throws if a name is used twice in props', function() {
    const keys = ['one', 'two'];
    let props = buildValidPropsForKeys(keys);
    keys.forEach(k => (props[k].name = 'duplicate'));
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        orderedKeys: keys,
        propsByKey: props
      })
    ).to.throw(Error, 'Name "duplicate" appears more than once in propsByKey');
  });

  it('does not throw if it finds an unexpected property', function() {
    const keys = ['mykey'];
    let props = buildValidPropsForKeys(keys);
    props['mykey'].extraStuff = 'here is something else';
    expect(() =>
      throwIfSerializedAnimationListIsInvalid({
        orderedKeys: keys,
        propsByKey: props,
        somethingElse: {}
      })
    ).not.to.throw();
  });
});

function buildValidPropsForKeys(keys) {
  return keys.reduce((memo, next) => {
    memo[next] = {
      name: next,
      sourceSize: {x: 0, y: 0},
      frameSize: {x: 0, y: 0},
      frameCount: 0,
      looping: true,
      frameDelay: 0
    };
    return memo;
  }, {});
}
