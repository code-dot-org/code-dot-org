/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import KNN from 'ml-knn';
import type {Store} from 'redux';

import {
  gradeAccuracy,
  getGradeOptions,
  getPercentCorrect,
} from '../helpers/accuracy';
import {isRegression} from '../helpers/columnDetails';
import {logMetric} from '../helpers/metrics';
import type {RootState} from '../redux';
import {
  setKValue,
  setTrainedModel,
  setPrediction,
  setAccuracyCheckPredictedLabels,
  setHistoricResult,
} from '../redux';
import type {TrainedModel} from '../types';

import type {Trainer} from './types';

export interface OptimalModelDetails {
  model: TrainedModel;
  predictedLabels: (number | string)[];
  kValue: number;
}

export default class KNNTrainer implements Trainer {
  private readonly store: Store<RootState>;
  private knn: KNN | undefined;

  constructor(store: Store<RootState>) {
    this.store = store;
  }

  startTraining(): void {
    const state = this.store.getState();

    const optimalModel = this.getOptimalModelDetails(state);

    this.storeTrainedModel(optimalModel);

    const trainedState = this.store.getState();

    logMetric('train-model', trainedState);

    this.storeHistoricResult(trainedState);
  }

  /*
    We modify algorithm hyperparameters (k) based on dataset size and type of
    machine learning in attempt to increase the liklihood of accurate
    models that behave in ways consistent with the mental model presented in
    the curriculum. For large classification datasets we try a variety of K
    values and select the one that yields the most accurate model.
  */
  getOptimalModelDetails(state: RootState): OptimalModelDetails {
    let bestModel: KNN | undefined;
    let bestPredictedLabels: (number | string)[] = [];
    let bestK = -1;
    let bestAccuracy = -1;
    const gradeOptions = getGradeOptions(state);

    this.possibleKValues(state).forEach((kValue: number) => {
      const model = new KNN(state.trainingExamples, state.trainingLabels, {
        k: kValue,
      });
      const predictedLabels = model.predict(state.accuracyCheckExamples);
      const {percentCorrect} = gradeAccuracy(
        predictedLabels,
        state.accuracyCheckLabels,
        gradeOptions,
      );
      // "NaN" from an empty check set loses this, so no model is stored.
      if (parseFloat(percentCorrect) > bestAccuracy) {
        bestAccuracy = parseFloat(percentCorrect);
        bestK = kValue;
        bestModel = model;
        bestPredictedLabels = predictedLabels;
      }
    });

    this.knn = bestModel;
    return {
      model: bestModel!,
      predictedLabels: bestPredictedLabels,
      kValue: bestK,
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

  batchPredict(accuracyCheckExamples: number[][]): (number | string)[] {
    if (!this.knn) {
      return [];
    }

    const predictedLabels = this.knn.predict(accuracyCheckExamples);
    this.store.dispatch(setAccuracyCheckPredictedLabels(predictedLabels));
    return predictedLabels;
  }

  predict(testValues: number[]): void {
    const state = this.store.getState();

    if (state.trainedModel) {
      const predictions = state.trainedModel.predict([testValues]);
      this.store.dispatch(setPrediction(predictions[0]));
    }
  }

  storeTrainedModel(optimalModel: OptimalModelDetails): void {
    this.store.dispatch(setKValue(optimalModel.kValue));
    this.store.dispatch(
      setAccuracyCheckPredictedLabels(optimalModel.predictedLabels),
    );
    this.store.dispatch(setTrainedModel(optimalModel.model));
  }

  storeHistoricResult(state: RootState): void {
    const accuracy = getPercentCorrect(state);
    this.store.dispatch(
      setHistoricResult(state.labelColumn!, state.selectedFeatures, accuracy),
    );
  }
}
