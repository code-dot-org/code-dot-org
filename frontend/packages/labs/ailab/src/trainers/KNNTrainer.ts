/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import KNN from 'ml-knn';

import {isRegression} from '../helpers/columnDetails';
import type {RootState} from '../redux';
import type {TrainedModel} from '../types';

import BaseTrainer from './BaseTrainer';
import type {TrainingResult} from './types';

export default class KNNTrainer extends BaseTrainer {
  /*
    We modify algorithm hyperparameters (k) based on dataset size and type of
    machine learning in attempt to increase the liklihood of accurate
    models that behave in ways consistent with the mental model presented in
    the curriculum. For large classification datasets we try a variety of K
    values and select the one that yields the most accurate model.
  */
  protected train(state: RootState): TrainingResult {
    let bestModel: TrainedModel | undefined;
    let bestPredictedLabels: (number | string)[] = [];
    let bestK = -1;
    let bestAccuracy = -1;

    this.possibleKValues(state).forEach((kValue: number) => {
      const model = new KNN(state.trainingExamples, state.trainingLabels, {
        k: kValue,
      });
      const {predictedLabels, accuracy} = this.gradeCandidate(state, model);
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestK = kValue;
        bestModel = model;
        bestPredictedLabels = predictedLabels;
      }
    });

    return {
      model: bestModel!,
      predictedLabels: bestPredictedLabels,
      hyperparameters: {k: bestK},
    };
  }

  possibleKValues(state: RootState): number[] {
    const datasetSize = state.data.length;
    const smallDatasetSize = 10;
    const mediumDatasetSize = 100;

    let kValues: number[] = [];
    const minimalK = 1;
    const smallK = 5;
    const defaultRegressionK =
      datasetSize < mediumDatasetSize ? minimalK : smallK;
    const defaultClassificationK = Math.round(datasetSize / 3);
    const defaultK = isRegression(state)
      ? defaultRegressionK
      : defaultClassificationK;

    if (state.accuracyCheckExamples.length > 0) {
      if (datasetSize <= smallDatasetSize && !isRegression(state)) {
        kValues.push(datasetSize);
      } else if (isRegression(state)) {
        kValues.push(defaultRegressionK);
      } else {
        kValues = this.calculatePotentialKValues(state).filter(
          (kValue: number) => kValue <= state.trainingExamples.length,
        );
      }
    } else {
      kValues.push(defaultK);
    }
    return kValues;
  }

  calculatePotentialKValues(state: RootState): number[] {
    const datasetSize = state.data.length;
    const trainingExamplesSize = state.trainingExamples.length;
    const possibleKValues = [1, 3, 5, 7, 17, 31, 45, 61];
    const heuristicK = Math.round(Math.sqrt(datasetSize));
    possibleKValues.push(heuristicK);
    const oneThird = Math.round(datasetSize / 3);
    possibleKValues.push(oneThird);
    return possibleKValues.filter(
      (kValue: number) => kValue <= trainingExamplesSize,
    );
  }
}
