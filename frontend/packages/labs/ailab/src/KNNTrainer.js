/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import { store } from "./index.js";
import { setPrediction, setAccuracyCheckPredictedLabels } from "./redux";

export default class KNNTrainer {
  startTraining() {
    const state = store.getState();
    this.knn = new ML.KNN(state.trainingExamples, state.trainingLabels, {
      k: 2
    });
    this.batchPredict(state.accuracyCheckExamples);
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
