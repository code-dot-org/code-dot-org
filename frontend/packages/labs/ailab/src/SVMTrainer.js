/* Training and prediction using a binary SVM machine learning model from (https://github.com/karpathy/svmjs) */

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
    this.buildOptionNumberKeysByFeature(state);
  }

  /* Builds a hash that maps a feature's categorical options to numbers because this implementation of the SVM algorithm only accepts numerical inputs.
  @param {string} - feature name
  @return {
    option1 : 0,
    option2 : 1,
    option3: 2,
    ...
  }
  */
  buildOptionNumberKey = feature => {
    let optionsMappedToNumbers = {};
    const uniqueOptions = getUniqueOptions(this.state, feature);
    uniqueOptions.forEach(
      option => (optionsMappedToNumbers[option] = uniqueOptions.indexOf(option))
    );
    return optionsMappedToNumbers;
  };

  /* Builds a hash that maps selected categorical features to their option-number keys and dispatches that hash to the Redux store.
  @return {
    feature1: {
      option1 : 0,
      option2 : 1,
      option3: 2,
      ...
    },
    feature2: {
      option1 : 0,
      option2 : 1,
      ...
    }
  }
  */
  buildOptionNumberKeysByFeature(state) {
    let optionsMappedToNumbersByFeature = {};
    const categoricalColumnsToConvert = getSelectedCategoricalColumns(
      state
    ).concat(this.state.labelColumn);
    categoricalColumnsToConvert.forEach(
      feature =>
        (optionsMappedToNumbersByFeature[feature] = this.buildOptionNumberKey(
          feature
        ))
    );
    store.dispatch(setFeatureNumberKey(optionsMappedToNumbersByFeature));
  }

  /* Builds a hash that maps the options in the label column to -1 and 1, because right now the model only supports binary classification with those specific values. Returns the row's specific option's value in that reference hash.
  @param {object} row, entry from the dataset
  {
    labelColumn: option,
    featureColumn1: option,
    featureColumn2: option
    ...
  }
  @return 1 or -1
  */
  extractLabels = row => {
    const updatedState = store.getState();
    const currentValues = Object.values(
      updatedState.featureNumberKey[this.state.labelColumn]
    );

    const converter = {};
    converter[currentValues[0]] = 1;
    converter[currentValues[1]] = -1;
    return converter[row[this.state.labelColumn]];
  };

  /* For feature columns that store categorical data, looks up the value associated with a row's specific option for a given feature; otherwise returns the option converted to an integer for feature columns that store continuous data.
  @param {object} row, entry from the dataset
  {
    labelColumn: option,
    featureColumn1: option,
    featureColumn2: option
    ...
  }
  @param {string} - feature name
  @return {integer}
  */
  convertValue = (feature, row) => {
    const updatedState = store.getState();
    return getCategoricalColumns(updatedState).includes(feature)
      ? updatedState.featureNumberKey[feature][row[feature]]
      : parseInt(row[feature]);
  };

  /* Builds an array containing integer values associated with each feature's specific option in a given row.
  @param {object} row, entry from the dataset
  {
    labelColumn: option,
    featureColumn1: option,
    featureColumn2: option
    ...
  }
  @return {array}
  */
  extractExamples = row => {
    let exampleValues = [];
    this.state.selectedFeatures.forEach(feature =>
      exampleValues.push(this.convertValue(feature, row))
    );
    return exampleValues;
  };

  startTraining() {
    this.addTrainingData();
  }

  addTrainingData() {
    const trainingExamples = this.state.data.map(this.extractExamples);
    const trainingLabels = this.state.data.map(this.extractLabels);
    this.train(trainingExamples, trainingLabels);
  }

  train(trainingExamples, trainingLabels) {
    this.svm.train(trainingExamples, trainingLabels);
  }

  prepareTestData() {
    let testValues = [];
    this.state.selectedFeatures.forEach(feature =>
      testValues.push(this.convertValue(feature, this.state.testData))
    );
    return testValues;
  }

  predict() {
    const testValues = this.prepareTestData();
    let prediction = {};
    prediction.predictedLabel = this.svm.predict([testValues])[0];
    prediction.confidence = Math.abs(this.svm.marginOne(testValues));
    store.dispatch(setPrediction(prediction));
  }

  clearAll() {
    this.initTrainingState();
  }
}
