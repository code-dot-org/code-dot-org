/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

import { store } from "./index.js";
import { setPrediction } from "./redux";

const KNN = require('ml-knn');

export default class KNNTrainer {
  startTraining() {
    const state = store.getState();
    this.knn = new KNN(state.trainingExamples, state.trainingLabels, {
      k: 2
    });
  }

  predict(testValues) {
    let prediction = {};
    prediction.predictedLabel = this.knn.predict([testValues])[0];
    store.dispatch(setPrediction(prediction));
  }
}
