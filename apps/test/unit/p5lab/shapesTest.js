import {throwIfSerializedAnimationListIsInvalid} from '@cdo/apps/p5lab/shapes';
import {expect} from '../../util/configuredChai';

describe('GameLab Shapes', function() {
  const propsByKeyOneItem = {
    '123': {
      name: 'a',
      frameSize: 4,
      frameCount: 4,
      looping: true,
      frameDelay: 2
    }
  };

  const propsByKeyTwoItem = {
    '123': {
      name: 'a',
      frameSize: 4,
      frameCount: 4,
      looping: true,
      frameDelay: 2
    },
    '456': {
      name: 'b',
      frameSize: 4,
      frameCount: 4,
      looping: true,
      frameDelay: 2
    }
  };

  it('does not throw an error for ordered keys with no duplicates', function() {
    const attributesNoDupes = {
      propsByKey: propsByKeyOneItem,
      orderedKeys: ['123']
    };
    throwIfSerializedAnimationListIsInvalid(attributesNoDupes);
    expect(attributesNoDupes['orderedKeys'].length).to.equal(1);
  });

  it('does not throw an error for a single duplicated key from ordered keys and deletes the duplicate', function() {
    const attributesOneDupe = {
      propsByKey: propsByKeyOneItem,
      orderedKeys: ['123', '123']
    };
    throwIfSerializedAnimationListIsInvalid(attributesOneDupe);
    expect(attributesOneDupe['orderedKeys'].length).to.equal(1);
  });

  it('does not throw an error for a key with multiple duplicates in ordered keys and deletes the duplicates', function() {
    const attributesMultiDupe = {
      propsByKey: propsByKeyOneItem,
      orderedKeys: ['123', '123', '123']
    };
    throwIfSerializedAnimationListIsInvalid(attributesMultiDupe);
    expect(attributesMultiDupe['orderedKeys'].length).to.equal(1);
  });

  it('does not throw an error for ordered keys with multiple keys with duplicates and deletes the duplicates', function() {
    const attributesMultiDupe = {
      propsByKey: propsByKeyTwoItem,
      orderedKeys: ['123', '123', '456', '456']
    };
    throwIfSerializedAnimationListIsInvalid(attributesMultiDupe);
    expect(attributesMultiDupe['orderedKeys'].length).to.equal(2);
    expect(attributesMultiDupe['orderedKeys'][0]).to.equal('123');
    expect(attributesMultiDupe['orderedKeys'][1]).to.equal('456');
  });
});
