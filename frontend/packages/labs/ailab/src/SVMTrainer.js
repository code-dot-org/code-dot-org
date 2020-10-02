/* Training and prediction using a binary SVM machine learning model from (https://github.com/karpathy/svmjs) */

/* eslint-env node */
const svmjs = require("svm");
import { store } from "./index.js";
import {
  setPrediction,
  getUniqueOptions,
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
    this.buildFeatureToNumberKey(state);
  }

  startTraining() {
    this.addTrainingData();
  }

  buildFeatureToNumberKeyForColumn = column => {
    let optionsMappedToNumbers = {};
    const uniqueOptions = getUniqueOptions(this.state, column);
    uniqueOptions.forEach(
      option => (optionsMappedToNumbers[option] = uniqueOptions.indexOf(option))
    );
    return optionsMappedToNumbers;
  };

  buildFeatureToNumberKey(state) {
    let optionsMappedToNumbersByFeature = {};
    getSelectedCategoricalColumns(state).forEach(
      feature =>
        (optionsMappedToNumbersByFeature[
          feature
        ] = this.buildFeatureToNumberKeyForColumn(feature))
    );
    store.dispatch(setFeatureNumberKey(optionsMappedToNumbersByFeature));
  }

  extractLabels = row => {
    return parseInt(row[this.state.labelColumn]);
  };

  convertValue = (feature, row) => {
    const updatedState = store.getState();
    return getSelectedCategoricalColumns(updatedState).includes(feature)
      ? updatedState.featureNumberKey[feature][row[feature]]
      : parseInt(row[feature]);
  };

  extractExamples = row => {
    let exampleValues = [];
    this.state.selectedFeatures.forEach(feature =>
      exampleValues.push(this.convertValue(feature, row))
    );
    return exampleValues;
  };

  addTrainingData() {
    const trainingExamples = this.state.data.map(this.extractExamples);
    const trainingLabels = this.state.data.map(this.extractLabels);
    this.train(trainingExamples, trainingLabels);
  }

  train(trainingExamples, trainingLabels) {
    this.svm.train(trainingExamples, trainingLabels);
  }

  predict() {
    const testValues = this.prepareTestData();
    let prediction = {};
    prediction.predictedLabel = this.svm.predict([testValues])[0];
    prediction.confidence = Math.abs(this.svm.marginOne(testValues));
    store.dispatch(setPrediction(prediction));
  }

  prepareTestData() {
    let testValues = [];
    this.state.selectedFeatures.forEach(feature =>
      testValues.push(parseInt(this.state.testData[feature]))
    );
    return testValues;
  }

  clearAll() {
    this.initTrainingState();
  }
}
