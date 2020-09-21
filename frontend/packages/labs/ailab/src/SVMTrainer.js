const svmjs = require("svm");
import { store } from "./index.js";

export default class SVMTrainer {
  constructor() {
    this.initTrainingState();
  }

  initTrainingState() {
    this.svm = new svmjs.SVM();
    const state = store.getState();
    this.state = state;
  }

  startTraining() {
    this.addTrainingData(this.state);
  }

  extractLabels = row => {
    return parseInt(row[this.state.labelColumn]);
  };

  extractExamples = row => {
    let exampleValues = [];
    this.state.selectedFeatures.forEach(feature =>
      exampleValues.push(parseInt(row[feature]))
    );
    return exampleValues;
  };

  addTrainingData(state) {
    const trainingExamples = state.data.map(this.extractExamples);
    const trainingLabels = state.data.map(this.extractLabels);
    this.train(trainingExamples, trainingLabels);
  }

  train(trainingExamples, trainingLabels) {
    this.svm.train(trainingExamples, trainingLabels);
  }

  clearAll() {
    this.initTrainingState();
  }
}
