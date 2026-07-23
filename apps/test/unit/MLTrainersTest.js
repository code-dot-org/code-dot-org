import {predict} from '@cdo/apps/MLTrainers';

describe('MLTrainers', () => {
  it('predicts with a saved ID3 classification tree', () => {
    const prediction = predict({
      selectedTrainer: 'id3Classify',
      trainedModel: {
        root: {
          type: 'decision',
          featureIndex: 0,
          splitType: 'categorical',
          defaultLabel: 0,
          children: {
            0: {type: 'leaf', prediction: 0},
            1: {type: 'leaf', prediction: 1},
          },
        },
      },
      featureNumberKey: {
        color: {blue: 0, green: 1},
        label: {no: 0, yes: 1},
      },
      label: {id: 'label', values: ['no', 'yes']},
      features: [{id: 'color', values: ['blue', 'green']}],
      testData: {color: 'green'},
    });

    expect(prediction).toBe('yes');
  });

  it('predicts with a saved ID3 numerical threshold tree', () => {
    const prediction = predict({
      selectedTrainer: 'id3Regress',
      trainedModel: {
        root: {
          type: 'decision',
          featureIndex: 0,
          splitType: 'numerical',
          threshold: 50,
          defaultLabel: 10,
          left: {type: 'leaf', prediction: 10},
          right: {type: 'leaf', prediction: 20},
        },
      },
      featureNumberKey: {},
      label: {id: 'cost'},
      features: [{id: 'temperature'}],
      testData: {temperature: '75'},
    });

    expect(prediction).toBe(20);
  });
});
