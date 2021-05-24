/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import { store } from "../index.js";
import {
  isRegression,
  getAccuracyRegression,
  getAccuracyClassification,
  setKValue,
  setModelSize,
  setTrainedModel,
  setPrediction,
  setAccuracyCheckPredictedLabels,
  getSummaryStat,
  setHistoricResult
} from "../redux";

const KNN = require("ml-knn");

export default class KNNTrainer {

  calculatePossibleKValues() {
    let possibleKValues = [1, 3, 5, 7, 17, 31, 45, 61];
    const state = store.getState();
    let datasetSize = state.data.length;
    const heuristicK = Math.round(Math.sqrt(datasetSize));
    possibleKValues.push(heuristicK);
    const oneThird = Math.round(datasetSize/3);
    possibleKValues.push(oneThird);
    return possibleKValues;
  }

  startTraining() {
    const state = store.getState();
    let bestModel = null;
    let bestPredictedLabels = [];
    let bestK = -1;
    let bestAccuracy = -1;
    if (state.accuracyCheckExamples.length > 0) {
      const kValues = this.calculatePossibleKValues();
      kValues.forEach(kValue => {
        this.knn = new KNN(
          state.trainingExamples,
          state.trainingLabels,
          {k: kValue}
        );
        var model = this.knn.toJSON();
        const predictedLabels = this.batchPredict(state.accuracyCheckExamples);
        const accuracy = this.getAccuracyPercent();
        if (accuracy > bestAccuracy) {
          bestAccuracy = accuracy;
          bestK = kValue;
          bestModel = model;
          bestPredictedLabels = predictedLabels;
        }
      })
    } else {
      const defaultK = isRegression(state) ?
        5 : Math.round(state.data.length/3);
      this.knn = new KNN(
        state.trainingExamples,
        state.trainingLabels,
        {k: defaultK}
      );
      bestModel = this.knn.toJSON();
      bestK = defaultK;
    }
    store.dispatch(setKValue(bestK));
    store.dispatch(setAccuracyCheckPredictedLabels(bestPredictedLabels));
    store.dispatch(setTrainedModel(bestModel));
    const size = Buffer.byteLength(JSON.stringify(bestModel));
    const kiloBytes = size / 1024;
    store.dispatch(setModelSize(kiloBytes));

    const state2 = store.getState();

    const accuracy = getSummaryStat(state2).stat;
    store.dispatch(
      setHistoricResult(state2.labelColumn, state2.selectedFeatures, accuracy)
    );
  }

  getAccuracyPercent() {
    const state = store.getState();
    const percent = isRegression(state)
      ? getAccuracyRegression(state).percentCorrect
      : getAccuracyClassification(state).percentCorrect;
    return parseFloat(percent);
  }

  batchPredict(accuracyCheckExamples) {
    const predictedLabels = this.knn.predict(accuracyCheckExamples);
    store.dispatch(setAccuracyCheckPredictedLabels(predictedLabels));
    return predictedLabels;
  }

  predict(testValues) {
    let prediction = {};
    prediction.predictedLabel = this.knn.predict([testValues])[0];
    store.dispatch(setPrediction(prediction));
  }
}
