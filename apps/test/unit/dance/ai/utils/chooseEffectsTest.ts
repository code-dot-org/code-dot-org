// change to js file?
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {chooseEffects} from '@cdo/apps/dance/ai/utils/chooseEffects';
import {EffectsQuality, FieldKey} from '@cdo/apps/dance/ai/types';

const weightMappings = {
  backgroundEffect: {
    emojiAssociations: {
      cyclone: [0, 1],
      'smiling-face-with-hearts': [0, 1],
      'party-popper': [0, 1],
    },
    output: ['quads', 'blooming_petals'],
  },
  foregroundEffect: {
    emojiAssociations: {
      cyclone: [0, 1],
      'smiling-face-with-hearts': [0, 1],
      'party-popper': [0, 1],
    },
    output: ['bubbles', 'hearts_colorful'],
  },
  backgroundColor: {
    emojiAssociations: {
      cyclone: [0, 1],
      'smiling-face-with-hearts': [0, 1],
      'party-popper': [0, 1],
    },
    output: ['autumn', 'rave'],
  },
};
describe('chooseEffects', () => {
  it('chooses good effects', () => {
    sinon.stub(Math, 'random').returns(0);
    const summedWeightStub = sinon.stub().returns([
      [0.5, 'quads'],
      [1.2, 'blooming_petals'],
    ]);

    // might not need to pass weightMappings
    const chosenEffects = chooseEffects(
      ['cyclone', 'smiling-face-with-hearts', 'party-popper'],
      EffectsQuality.GOOD,
      weightMappings,
      summedWeightStub
    );

    const expected = {
      backgroundEffect: 'blooming_petals',
      foregroundEffect: 'blooming_petals',
      backgroundColor: 'blooming_petals',
    };
    expect(chosenEffects.backgroundEffect).to.equal(expected.backgroundEffect);
    expect(chosenEffects.foregroundEffect).to.equal(expected.foregroundEffect);
    expect(chosenEffects.backgroundColor).to.equal(expected.backgroundColor);
    sinon.restore();
  });

  it('chooses bad effects', () => {
    sinon.stub(Math, 'random').returns(0);
    const summedWeightStub = sinon.stub().returns([
      [0.5, 'quads'],
      [1.2, 'blooming_petals'],
    ]);

    // might not need to pass weightMappings
    const chosenEffects = chooseEffects(
      ['cyclone', 'smiling-face-with-hearts', 'party-popper'],
      EffectsQuality.BAD,
      weightMappings,
      summedWeightStub
    );

    const expected = {
      backgroundEffect: 'quads',
      foregroundEffect: 'quads',
      backgroundColor: 'quads',
    };
    expect(chosenEffects.backgroundEffect).to.equal(expected.backgroundEffect);
    expect(chosenEffects.foregroundEffect).to.equal(expected.foregroundEffect);
    expect(chosenEffects.backgroundColor).to.equal(expected.backgroundColor);
    sinon.restore();
  });
});
