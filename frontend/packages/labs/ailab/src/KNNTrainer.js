/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

const knnjs = require("ml-knn");
import { store } from "./index.js";
import { setPrediction } from "./redux";

export default class KNNTrainer {
  startTraining() {
    const state = store.getState();
    this.knn = new ML.KNN(state.trainingExamples, state.trainingLabels, {
      k: 2
    });
  }

  predict(testValues) {
    console.log("testValues in KNNTrainer", testValues);
    let prediction = {};
    prediction.predictedLabel = this.knn.predict([testValues])[0];
    store.dispatch(setPrediction(prediction));
  }

  clearAll() {
    this.initTrainingState();
  }
}
