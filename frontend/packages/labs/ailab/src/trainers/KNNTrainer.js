/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import { store } from "../index.js";
import {
  setModelSize,
  setTrainedModel,
  setPrediction,
  setAccuracyCheckPredictedLabels,
  getSummaryStat,
  setHistoricResult
} from "../redux";

const KNN = require("ml-knn");

export default class KNNTrainer {
  startTraining() {
    const state = store.getState();
    this.knn = new KNN(state.trainingExamples, state.trainingLabels);
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

    const state2 = store.getState();

    const accuracy = getSummaryStat(state2).stat;
    store.dispatch(
      setHistoricResult(state2.labelColumn, state2.selectedFeatures, accuracy)
    );
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
