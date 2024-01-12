import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {chooseEffects} from '@cdo/apps/dance/ai/utils/chooseEffects';
import * as calculateOutputSummedWeights from '@cdo/apps/dance/ai/utils/calculateOutputSummedWeights';
import {EffectsQuality} from '@cdo/apps/dance/ai/types';

describe('chooseEffects', () => {
  beforeEach(() => {
    sinon.stub(Math, 'random').returns(0);
    sinon
      .stub(calculateOutputSummedWeights, 'calculateOutputSummedWeights')
      .returns([
        [0.1, 'quads (bad fit)'],
        [2.9, 'blooming_petals (good fit)'],
      ]);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('chooses a good effect', () => {
    const chosenEffects = chooseEffects(
      ['cyclone', 'smiling-face-with-hearts', 'party-popper'],
      EffectsQuality.GOOD,
      1
    );

    expect(chosenEffects.backgroundEffect).to.equal(
      'blooming_petals (good fit)'
    );
    expect(chosenEffects.foregroundEffect).to.equal(
      'blooming_petals (good fit)'
    );
    expect(chosenEffects.backgroundColor).to.equal(
      'blooming_petals (good fit)'
    );
  });

  it('chooses a bad effect', () => {
    const chosenEffects = chooseEffects(
      ['cyclone', 'smiling-face-with-hearts', 'party-popper'],
      EffectsQuality.BAD,
      1
    );

    expect(chosenEffects.backgroundEffect).to.equal('quads (bad fit)');
    expect(chosenEffects.foregroundEffect).to.equal('quads (bad fit)');
    expect(chosenEffects.backgroundColor).to.equal('quads (bad fit)');
  });
});
