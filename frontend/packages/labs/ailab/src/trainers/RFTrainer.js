/* Training and prediction using a regression Random Forest ensemble machine learning model from
https://github.com/mljs/random-forest */

import { store } from "../index.js";
import { setPrediction, setAccuracyCheckPredictedLabels } from "../redux";

export default class RFTrainer {
  constructor() {
    this.initTrainingState();
  }

  initTrainingState() {
    this.rfregression = new ML.DecisionTreeRegression();
  }

  normalizeValue = (value, max) => {
    // console.log("value", value);
    // console.log("max", max);
    // console.log("min", min);
    return value / max;
  };

  startTraining() {
    const state = store.getState();
    // console.log("trainingExamples", state.trainingExamples.flat());
    // console.log("trainingLabels", state.trainingLabels);
    // console.log("accuracyCheckExamples", state.accuracyCheckExamples.flat());

    const normalizedExamples = state.trainingExamples
      .flat()
      .map(value =>
        this.normalizeValue(value, Math.max(...state.trainingExamples.flat()))
      )
      .slice(0, 100)
      .sort();

    const normalizedLabels = state.trainingLabels
      .map(label =>
        this.normalizeValue(label, Math.max(...state.trainingLabels))
      )
      .slice(0, 100)
      .sort();

    console.log("normalizedExamples", normalizedExamples);
    console.log("normalizedLabels", normalizedLabels);

    const x = new Array(100);
    const y = new Array(100);
    let val = 0.0;
    for (let i = 0; i < x.length; ++i) {
      x[i] = val;
      y[i] = Math.sin(x[i]);
      val += 0.01;
    }

    console.log("x", x);
    console.log("y", y);
    // this.rfregression.train(x, y);
    this.rfregression.train(normalizedExamples, normalizedLabels);
    console.log("prediction", this.rfregression.predict([0.75]));

    // this.rfregression.train(
    //   state.trainingExamples.flat(),
    //   state.trainingLabels
    // );
    // this.rfregression.predict(state.accuracyCheckExamples.flat());
    // this.batchPredict(state.accuracyCheckExamples);
  }

  batchPredict(accuracyCheckExamples) {
    const predictedLabels = this.rfregression.predict(accuracyCheckExamples);
    store.dispatch(setAccuracyCheckPredictedLabels(predictedLabels));
  }

  predict(testValues) {
    let prediction = {};
    prediction.predictedLabel = this.rfregression.predict([testValues])[0];
    store.dispatch(setPrediction(prediction));
  }
}
