import {getMlFeatureValuesFromElements} from '@cdo/apps/buildlab/mlModel';

describe('Build Lab ML model data', () => {
  it('adapts generated model controls into feature values', () => {
    const featureValues = getMlFeatureValuesFromElements('model123456', [
      {
        id: 'color-input',
        inputValue: 'purple',
        kind: 'dropdown',
        label: 'purple',
        mlFeatureId: 'petal color',
        mlModelId: 'model123456',
        options: ['purple', 'yellow'],
        screenId: 'screen1',
        x: 0,
        y: 0,
      },
      {
        id: 'height-input',
        inputValue: '12',
        kind: 'textInput',
        label: 'height',
        mlFeatureId: 'height',
        mlModelId: 'model123456',
        screenId: 'screen1',
        x: 0,
        y: 0,
      },
      {
        id: 'other-model-input',
        inputValue: 'ignored',
        kind: 'textInput',
        label: 'other',
        mlFeatureId: 'other',
        mlModelId: 'different123',
        screenId: 'screen1',
        x: 0,
        y: 0,
      },
    ]);

    expect(featureValues).toEqual({'petal color': 'purple', height: '12'});
  });

  it('uses a dropdown first option when it has no current input value', () => {
    const featureValues = getMlFeatureValuesFromElements('model123456', [
      {
        id: 'color-input',
        kind: 'dropdown',
        label: 'purple',
        mlFeatureId: 'petal color',
        mlModelId: 'model123456',
        options: ['purple', 'yellow'],
        screenId: 'screen1',
        x: 0,
        y: 0,
      },
    ]);

    expect(featureValues).toEqual({'petal color': 'purple'});
  });
});
