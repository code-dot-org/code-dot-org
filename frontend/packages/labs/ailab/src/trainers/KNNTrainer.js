/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import {
  isRegression,
  setKValue,
  setModelSize,
  setTrainedModel,
  setPrediction,
  setAccuracyCheckPredictedLabels,
  setHistoricResult,
  getPercentCorrect
} from "../redux";
import { logFirehoseMetric } from "../helpers/metrics";
const KNN = require("ml-knn");

export default class KNNTrainer {
  calculatePossibleKValues() {
    const state = this.store.getState();
    let datasetSize = state.data.length;
    let possibleKValues = [1, 3, 5, 7, 17, 31, 45, 61];
    const heuristicK = Math.round(Math.sqrt(datasetSize));
    possibleKValues.push(heuristicK);
    const oneThird = Math.round(datasetSize / 3);
    possibleKValues.push(oneThird);
    return possibleKValues;
  }

  startTraining(store) {
    this.store = store;
    const state = store.getState();
    const datasetSize = state.data.length;
    /*
      We modify algorithm hyperparameters (k) based on dataset size and type of
      machine learning in attempt to increase the liklihood of accurate
      models that behave in ways consistent with the mental model presented in
      the curriculum.
    */
    const smallDatasetSize = 10;
    const mediumDatasetSize = 100;
    const minimalK = 1;
    const smallK = 5;
    const defaultRegressionK = datasetSize < mediumDatasetSize
      ? minimalK
      : smallK;
    const defaultClassificationK = Math.round(datasetSize / 3);

    let bestModel = null;
    let bestPredictedLabels = [];
    let bestK = -1;
    let bestAccuracy = -1;
    if (state.accuracyCheckExamples.length > 0) {
      if (datasetSize <= smallDatasetSize && !isRegression(state)) {
        this.knn = new KNN(state.trainingExamples, state.trainingLabels, {
          k: datasetSize
        });
        bestModel = this.knn;
        bestK = datasetSize;
      } else if (isRegression(state)) {
        this.knn = new KNN(state.trainingExamples, state.trainingLabels, {
          k: defaultRegressionK
        });
        bestModel = this.knn;
        bestK = defaultRegressionK;
      } else {
        const kValues = this.calculatePossibleKValues();
        kValues
          .filter(kValue => kValue <= state.trainingExamples.length)
          .forEach(kValue => {
            this.knn = new KNN(state.trainingExamples, state.trainingLabels, {
              k: kValue
            });
            var model = this.knn;
            const predictedLabels = this.batchPredict(
              state.accuracyCheckExamples
            );
            const accuracy = this.getAccuracyPercent();
            if (accuracy > bestAccuracy) {
              bestAccuracy = accuracy;
              bestK = kValue;
              bestModel = model;
              bestPredictedLabels = predictedLabels;
            }
          });
        }
      } else {
      const defaultK = isRegression(state)
        ? defaultRegressionK
        : defaultClassificationK;
      this.knn = new KNN(state.trainingExamples, state.trainingLabels, {
        k: defaultK
      });
      bestModel = this.knn;
      bestK = defaultK;
    }
    store.dispatch(setKValue(bestK));
    store.dispatch(setAccuracyCheckPredictedLabels(bestPredictedLabels));
    store.dispatch(setTrainedModel(bestModel));
    const size = Buffer.byteLength(JSON.stringify(bestModel));
    const kiloBytes = size / 1024;
    store.dispatch(setModelSize(kiloBytes));

    const state2 = store.getState();

    logFirehoseMetric("train-model", state2);

    const accuracy = getPercentCorrect(state2);
    store.dispatch(
      setHistoricResult(state2.labelColumn, state2.selectedFeatures, accuracy)
    );
  }

  getAccuracyPercent() {
    const state = this.store.getState();
    const percent = getPercentCorrect(state);
    return parseFloat(percent);
  }

  batchPredict(accuracyCheckExamples) {
    const predictedLabels = this.knn.predict(accuracyCheckExamples);
    this.store.dispatch(setAccuracyCheckPredictedLabels(predictedLabels));
    return predictedLabels;
  }

  predict(testValues) {
    const state = this.store.getState();
    const prediction = state.trainedModel.predict(testValues);
    this.store.dispatch(setPrediction(prediction));
  }
}
