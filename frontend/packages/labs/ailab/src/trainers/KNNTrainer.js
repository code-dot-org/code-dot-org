/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import {
  isRegression,
  setKValue,
  setTrainedModel,
  setPrediction,
  setAccuracyCheckPredictedLabels,
  setHistoricResult,
  getPercentCorrect
} from "../redux";
import { logFirehoseMetric } from "../helpers/metrics";
const KNN = require("ml-knn");

export default class KNNTrainer {

  startTraining(store) {
    this.store = store;
    const state = store.getState();

    const trainedModel = this.getOptimalModelDetails(state);

    this.storeTrainedModel(store, trainedModel);

    const state2 = store.getState();

    logFirehoseMetric("train-model", state2);

    this.storeHistoricResult(store, state2);
  }

  /*
    We modify algorithm hyperparameters (k) based on dataset size and type of
    machine learning in attempt to increase the liklihood of accurate
    models that behave in ways consistent with the mental model presented in
    the curriculum. For large classification datasets we try a variety of K
    values and select the one that yields the most accurate model.
  */
  getOptimalModelDetails(state) {
    let bestModel = null;
    let bestPredictedLabels = [];
    let bestK = -1;
    let bestAccuracy = -1;
    const kValues = this.possibleKValues(state);
    kValues.forEach(kValue => {
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
    return {
      model: bestModel,
      predictedLabels: bestPredictedLabels,
      kValue: bestK
    };
  }

  possibleKValues(state) {
    let datasetSize = state.data.length;
    const smallDatasetSize = 10;
    const mediumDatasetSize = 100;

    let kValues = [];
    const minimalK = 1;
    const smallK = 5;
    const defaultRegressionK = datasetSize < mediumDatasetSize
      ? minimalK
      : smallK;
    const defaultClassificationK = Math.round(datasetSize / 3);
    const defaultK = isRegression(state)
      ? defaultRegressionK
      : defaultClassificationK;

    if (state.accuracyCheckExamples.length > 0) {
      if (datasetSize <= smallDatasetSize && !isRegression(state)) {
        kValues.push(datasetSize)
      } else if (isRegression(state)) {
        kValues.push(defaultRegressionK)
      } else {
        kValues = this.calculatePotentialKValues(state)
          .filter(kValue => kValue <= state.trainingExamples.length)
      }
    } else {
      kValues.push(defaultK)
    }
    return kValues;
  }

  calculatePotentialKValues(state) {
    let datasetSize = state.data.length;
    const trainingExamplesSize = state.trainingExamples.length;
    const possibleKValues = [1, 3, 5, 7, 17, 31, 45, 61];
    const heuristicK = Math.round(Math.sqrt(datasetSize));
    possibleKValues.push(heuristicK);
    const oneThird = Math.round(datasetSize / 3);
    possibleKValues.push(oneThird);
    return possibleKValues.filter(kValue => kValue <= trainingExamplesSize);
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

  storeTrainedModel(store, trainedModel) {
    store.dispatch(setKValue(trainedModel.kValue));
    store.dispatch(setAccuracyCheckPredictedLabels(
      trainedModel.predictedLabels
    ));
    store.dispatch(setTrainedModel(trainedModel.model));
  }

  storeHistoricResult(store, state) {
    const accuracy = getPercentCorrect(state);
    store.dispatch(
      setHistoricResult(state.labelColumn, state.selectedFeatures, accuracy)
    );
  }
}
