// change to js file?
import {expect} from '../../../../util/reconfiguredChai';
import {calculateOutputSummedWeights} from '@cdo/apps/dance/ai/utils/calculateOutputSummedWeights';

const outputWeightsMapping = {
  emojiAssociations: {
    cyclone: [0.2, 0.3],
    'smiling-face-with-hearts': [0.2, 0.3],
    'party-popper': [0.1, 0.6],
  },
  output: [],
};

describe('outputWeightsMapping', () => {
  it('sums weights', () => {
    const summedWeights = calculateOutputSummedWeights(
      ['cyclone', 'smiling-face-with-hearts', 'party-popper'],
      outputWeightsMapping
    );

    expect(summedWeights[0]).to.be.closeTo(0.5, 0.00001);
    expect(summedWeights[1]).to.be.closeTo(1.2, 0.00001);
  });
});
