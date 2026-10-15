import {
  convertValueForDisplay,
  convertValueForTraining,
  getConvertedPredictedLabel,
  getConvertedLabels,
  getConvertedAccuracyCheckExamples,
} from '../../src/helpers/valueConversion';

import {classificationState, classificationProject} from './testData';

describe('converting categorical values', () => {
  const categoryOptionStrings = Object.keys(
    classificationState.featureNumberKey[classificationProject.labelColumn],
  );

  const numbersForMLTraining = Object.values(
    classificationState.featureNumberKey[classificationProject.labelColumn],
  );

  test('convert value for display', async () => {
    numbersForMLTraining.forEach((number, i) => {
      const stringCategory = categoryOptionStrings[i];
      const convertedValue = convertValueForDisplay(
        classificationState,
        classificationProject,
        number,
        classificationProject.labelColumn,
      );
      expect(stringCategory).toBe(convertedValue);
    });
  });

  test('convert value for training', async () => {
    categoryOptionStrings.forEach((string, i) => {
      const machineLearningNumber = numbersForMLTraining[i];
      const convertedValue = convertValueForTraining(
        classificationState,
        classificationProject,
        string,
        classificationProject.labelColumn,
      );
      expect(machineLearningNumber).toBe(convertedValue);
    });
  });

  test('convert predicted label for display', async () => {
    const predictedLabel = getConvertedPredictedLabel(
      classificationState,
      classificationProject,
    );
    expect(predictedLabel).toBe('yes');
  });

  test('convert labels for display', async () => {
    const labels = getConvertedLabels(
      classificationState,
      classificationProject,
      classificationState.accuracyCheckLabels,
    );
    expect(labels).toEqual(['no', 'yes', 'yes', 'yes', 'yes', 'no']);
  });

  test('convert accuracy check examples for display', async () => {
    const examples = getConvertedAccuracyCheckExamples(
      classificationState,
      classificationProject,
    );
    expect(examples).toEqual([
      ['cool', 'rainy'],
      ['mild', 'rainy'],
      ['mild', 'overcast'],
      ['mild', 'sunny'],
      ['hot', 'overcast'],
      ['hot', 'sunny'],
    ]);
  });
});
