import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {chooseEffects} from '@cdo/apps/dance/ai/utils/chooseEffects';
import * as calculateOutputSummedWeights from '@cdo/apps/dance/ai/utils/calculateOutputSummedWeights';
import {EffectsQuality} from '@cdo/apps/dance/ai/types';

describe('chooseEffects', () => {
  beforeEach(() => {
    sinon.stub(Math, 'random').returns(0.99);
    sinon
      .stub(calculateOutputSummedWeights, 'calculateOutputSummedWeights')
      .returns([
        [2.9, 'blooming_petals (1st)'],
        [1.2, 'quads (3rd)'],
        [0.3, 'circles (4th)'],
        [0.1, 'clouds (5th)'],
        [2.1, 'color_cycle (2nd)'],
      ]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('chooses a good effect', () => {
    const chosenEffects = chooseEffects(
      ['cyclone', 'smiling-face-with-hearts', 'party-popper'],
      EffectsQuality.GOOD
    );

    expect(chosenEffects.backgroundEffect).to.equal('quads (3rd)');
    expect(chosenEffects.foregroundEffect).to.equal('quads (3rd)');
    expect(chosenEffects.backgroundColor).to.equal('quads (3rd)');
  });

  it('chooses a bad effect', () => {
    const chosenEffects = chooseEffects(
      ['cyclone', 'smiling-face-with-hearts', 'party-popper'],
      EffectsQuality.BAD
    );

    expect(chosenEffects.backgroundEffect).to.equal('clouds (5th)');
    expect(chosenEffects.foregroundEffect).to.equal('clouds (5th)');
    expect(chosenEffects.backgroundColor).to.equal('clouds (5th)');
  });
});
