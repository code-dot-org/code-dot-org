/* Training and prediction using a binary SVM machine learning model from
(https://github.com/karpathy/svmjs) */

/* eslint-env node */
const svmjs = require("svm");
import { store } from "./index.js";
import {
  setPrediction,
  getUniqueOptions,
  getCategoricalColumns,
  getSelectedCategoricalColumns,
  setFeatureNumberKey
} from "./redux";

export default class SVMTrainer {
  constructor() {
    this.initTrainingState();
  }

  initTrainingState() {
    this.svm = new svmjs.SVM();
    const state = store.getState();
    this.state = state;
  }

  /* Builds a hash that maps the options in the label column to -1 and 1,
  because this model only supports binary classification with those
  specific values. Returns -1 or 1 depending on passed in label option.
  @param option from label column
  @return 1 or -1
  */
  convertLabel = labelOption => {
    const converter = {};
    converter[this.state.trainingLabels[0]] = 1;
    converter[this.state.trainingLabels[1]] = -1;
    return converter[labelOption];
  };

  startTraining() {
    this.addTrainingData();
  }

  addTrainingData() {
    const trainingExamples = this.state.trainingExamples;
    const trainingLabels = this.state.trainingLabels.map(this.convertLabel);
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
