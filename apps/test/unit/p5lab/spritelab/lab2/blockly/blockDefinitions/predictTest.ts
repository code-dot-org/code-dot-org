import predict from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/predict';

import {fakeBlock, fakeGenerator} from '../blockDefinitionFakes';

describe('spritelab2_predict', () => {
  it('reads as an empty string until it has a model shape', () => {
    expect(predict.generator(fakeBlock(), fakeGenerator())).toEqual([
      '""',
      expect.any(Number),
    ]);
  });

  it('asks the model with one entry per feature', () => {
    const block = fakeBlock(
      {},
      {
        modelShape: {
          id: 'qst6',
          name: 'dogmood',
          features: [
            {id: 'food', yesNo: true},
            {id: 'bone', yesNo: true},
          ],
        },
      }
    );
    const [code] = predict.generator(
      block,
      fakeGenerator({FEATURE_food: 'isTouchingSprite(a, b)'})
    ) as [string, number];
    expect(code).toBe(
      'predictWith("qst6", {"food": isTouchingSprite(a, b), "bone": null})'
    );
  });
});
