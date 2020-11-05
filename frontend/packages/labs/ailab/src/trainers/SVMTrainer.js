/* Training and prediction using a binary SVM machine learning model from
https://github.com/mljs/svm */

/* eslint-env node */
import { store } from "../index.js";
import { setPrediction, setAccuracyCheckPredictedLabels } from "../redux";

const SVM = require("ml-svm");

export default class SVMTrainer {
  constructor() {
    this.initTrainingState();
  }

  initTrainingState() {
    var options = {
      C: 0.01,
      tol: 10e-4,
      maxPasses: 10,
      maxInterations: 10000,
      kernel: "rbf",
      kernelOptions: {
        sigma: 0.5
      }
    };
    this.svm = new SVM(options);
    this.converter = {};
  }

  /* Builds a hash that maps the options in the label column to -1 and 1,
  because this model only supports binary classification with those
  specific values. Returns -1 or 1 depending on passed in label option.
  @param option from label column
  @return 1 or -1
  */
  convertLabel = (labelOption, key) => {
    const converter = {};
    converter[key[Object.keys(key)[0]]] = 1;
    converter[key[Object.keys(key)[1]]] = -1;
    this.converter = converter;
    return converter[labelOption];
  };

  convertPredictedLabel = predictedLabel => {
    return parseInt(
      Object.keys(this.converter).find(
        key => this.converter[key] === predictedLabel
      )
    );
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
    if (state.accuracyCheckExamples.length > 0) {
      this.batchPredict(state.accuracyCheckExamples);
    } else {
      store.dispatch(setAccuracyCheckPredictedLabels([]));
    }
  }

  train(trainingExamples, trainingLabels) {
    this.svm.train(trainingExamples, trainingLabels);
  }

  batchPredict(accuracyCheckExamples) {
    const predictedLabels = this.svm.predict(accuracyCheckExamples);
    const convertedPredictedLabels = predictedLabels.map(predictedLabel =>
      this.convertPredictedLabel(predictedLabel)
    );
    store.dispatch(setAccuracyCheckPredictedLabels(convertedPredictedLabels));
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
