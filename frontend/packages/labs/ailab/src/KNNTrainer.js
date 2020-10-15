/* Training and prediction using a multiclassification KNN machine learning model from
https://github.com/mljs/knn */

const knnjs = require("ml-knn");

export default class KNNTrainer {
  constructor() {
    this.initTrainingState();
  }

  initTrainingState() {
    this.knn = new knnjs.KNN();
  }

  startTraining() {
    this.addTrainingData();
  }

  addTrainingData() {
    const state = store.getState();
    this.train(state.trainingExamples, state.trainingLabels);
  }

  train(trainingExamples, trainingLabels) {
    this.knn(trainingExamples, trainingLabels, { k: 2 });
  }

  predict(testValues) {
    let prediction = {};
    prediction.predictedLabel = this.knn.predict([testValues])[0];
    console.log("prediction", prediction);
    store.dispatch(setPrediction(prediction));
  }

  clearAll() {
    this.initTrainingState();
  }
}
