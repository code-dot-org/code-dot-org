/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import KNN from 'ml-knn';

import {isRegression} from '../helpers/columnDetails';
import type {RootState} from '../redux';
import type {Hyperparameters, TrainedModel} from '../types';

import BaseTrainer from './BaseTrainer';

export default class KNNTrainer extends BaseTrainer<number> {
  /*
    We modify algorithm hyperparameters (k) based on dataset size and type of
    machine learning in attempt to increase the liklihood of accurate
    models that behave in ways consistent with the mental model presented in
    the curriculum. For large classification datasets we try a variety of K
    values and select the one that yields the most accurate model.
  */
  protected candidates(state: RootState): number[] {
    return this.possibleKValues(state);
  }

  protected buildModel(state: RootState, kValue: number): TrainedModel {
    return new KNN(state.trainingExamples, state.trainingLabels, {k: kValue});
  }

  protected hyperparameters(kValue: number): Hyperparameters {
    return {k: kValue};
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
