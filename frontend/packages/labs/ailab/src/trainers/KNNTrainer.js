/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import { store } from "../index.js";
import {
  isRegression,
  setModelSize,
  setTrainedModel,
  setPrediction,
  setAccuracyCheckPredictedLabels
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
    const k = isRegression(state) ? 5 : Math.round(0.33 * state.data.length);
    this.knn = new KNN(state.trainingExamples, state.trainingLabels, {k: k});
    var model = this.knn.toJSON();
    store.dispatch(setTrainedModel(model));
    const size = Buffer.byteLength(JSON.stringify(model));
    const kiloBytes = size / 1024;

    if (state.accuracyCheckExamples.length > 0) {
      this.batchPredict(state.accuracyCheckExamples);
    } else {
      store.dispatch(setAccuracyCheckPredictedLabels([]));
    }

    setTimeout(() => {
      store.dispatch(setModelSize(kiloBytes));
    }, 3000);
  }

  batchPredict(accuracyCheckExamples) {
    const predictedLabels = this.knn.predict(accuracyCheckExamples);
    store.dispatch(setAccuracyCheckPredictedLabels(predictedLabels));
  }

  predict(testValues) {
    let prediction = {};
    prediction.predictedLabel = this.knn.predict([testValues])[0];
    store.dispatch(setPrediction(prediction));
  }
}
