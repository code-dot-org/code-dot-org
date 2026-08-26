const predictMock = jest.fn();
jest.mock('@cdo/apps/MLTrainers', () => ({
  predict: (params: unknown) => predictMock(params),
}));

import {
  AiModel,
  featureValue,
  isYesNoFeature,
  modelShape,
  predictWith,
} from '@cdo/apps/p5lab/spritelab/lab2/aiModel';

const dogMood: AiModel = {
  name: 'dogmood',
  selectedTrainer: 'knnClassify',
  trainedModel: {},
  label: {id: 'mood', values: ['happy', 'sad', 'confused']},
  features: [
    {id: 'food', values: ['yes', 'no']},
    {id: 'bone', values: ['yes', 'no']},
    {id: 'toy', values: ['yes', 'no']},
  ],
  featureNumberKey: {
    mood: {happy: 0, sad: 1, confused: 2},
    food: {yes: 0, no: 1},
    bone: {yes: 0, no: 1},
    toy: {yes: 0, no: 1},
  },
};

describe('SpriteLab2 aiModel', () => {
  beforeEach(() => predictMock.mockReset());

  it('recognises a yes/no feature whatever its case', () => {
    expect(isYesNoFeature({id: 'a', values: ['yes', 'no']})).toBe(true);
    expect(isYesNoFeature({id: 'a', values: ['No', 'Yes']})).toBe(true);
    expect(isYesNoFeature({id: 'a', values: ['yes', 'no', 'maybe']})).toBe(
      false
    );
    expect(isYesNoFeature({id: 'a'})).toBe(false);
  });

  it('describes the shape a block draws', () => {
    expect(modelShape('id1', dogMood)).toEqual({
      id: 'id1',
      name: 'dogmood',
      features: [
        {id: 'food', yesNo: true},
        {id: 'bone', yesNo: true},
        {id: 'toy', yesNo: true},
      ],
    });
  });

  it('maps a boolean onto a yes/no feature in the model spelling', () => {
    const feature = {id: 'food', values: ['Yes', 'No']};
    expect(featureValue(feature, true)).toBe('Yes');
    expect(featureValue(feature, false)).toBe('No');
    expect(featureValue(feature, 'yes')).toBe('Yes');
  });

  it('passes other categorical and numeric values through', () => {
    expect(
      featureValue({id: 'size', values: ['Small', 'Large']}, 'large')
    ).toBe('Large');
    expect(featureValue({id: 'legs', min: 0, max: 8}, '4')).toBe(4);
  });

  it('asks the trainer with test data keyed by feature id', () => {
    predictMock.mockReturnValue('happy');
    const result = predictWith(dogMood, {food: true, bone: false, toy: true});
    expect(result).toBe('happy');
    expect(predictMock).toHaveBeenCalledTimes(1);
    const params = predictMock.mock.calls[0][0];
    expect(params.testData).toEqual({food: 'yes', bone: 'no', toy: 'yes'});
    expect(params.selectedTrainer).toBe('knnClassify');
  });

  it('treats a missing input as no for a yes/no feature', () => {
    predictMock.mockReturnValue('sad');
    predictWith(dogMood, {food: true});
    const params = predictMock.mock.calls[0][0];
    expect(params.testData.bone).toBe('no');
    expect(params.testData.toy).toBe('no');
  });
});
