/* Training and prediction using a binary SVM machine learning model from
(https://github.com/karpathy/svmjs) */

/* eslint-env node */
const svmjs = require("svm");
import { store } from "../index.js";
import { setPrediction } from "../redux";

export default class SVMTrainer {
  constructor() {
    this.initTrainingState();
  }

  initTrainingState() {
    this.svm = new svmjs.SVM();
  }

  /* Builds a hash that maps the options in the label column to -1 and 1,
  because this model only supports binary classification with those
  specific values. Returns -1 or 1 depending on passed in label option.
  @param option from label column
  @return 1 or -1
  */
  convertLabel = (labelOption, key) => {
    const converter = {};
    converter[key[0]] = -1;
    converter[key[1]] = 1;
    return converter[labelOption];
  };

  startTraining() {
    this.addTrainingData();
  }

  addTrainingData() {
    const state = store.getState();
    const trainingExamples = state.trainingExamples;
    const trainingLabels = state.trainingLabels.map(labelOption =>
      this.convertLabel(labelOption, state.featureNumberKey[state.labelColumn])
    );
    this.train(trainingExamples, trainingLabels);
  }

  train(trainingExamples, trainingLabels) {
    this.svm.train(trainingExamples, trainingLabels);
  }

  predict(testValues) {
    let prediction = {};
    prediction.predictedLabel = this.svm.predict([testValues])[0];
    prediction.confidence = Math.abs(this.svm.marginOne(testValues));
    store.dispatch(setPrediction(prediction));
  }

  clearAll() {
    this.initTrainingState();
  }
}
