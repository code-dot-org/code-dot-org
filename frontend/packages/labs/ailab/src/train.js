/* Generic machine learning handlers that route to the selected trainer. */

import SVMTrainer from "./SVMTrainer";
import KNNTrainer from "./KNNTrainer";
import { store } from "./index.js";
import {
  getUniqueOptions,
  getCategoricalColumns,
  getSelectedCategoricalColumns,
  setFeatureNumberKey
} from "./redux";

export const availableTrainers = {
  binary_svm: {
    name: "Binary SVM",
    description:
      "Uses the Support Vector Machine algorithm to classify an example as one of two options. Features can be categorical or continuous.",
    mlType: "binary"
  },
  knn: {
    name: "KNN",
    description:
      "Uses the K-Nearest Neighbor algorithm to classify an example as one of N options.  Features can be categorical or continuous. K is currently set to 2, but this is customizable.",
    mlType: "multi"
  }
};

// export class Trainer {
//   constructor() {
//     this.initTrainingState();
//   }
//
//   initTrainingState() {
//     const state = store.getState();
//     this.state = state;
//     buildOptionNumberKeysByFeature(state);
//     let trainer;
//     switch (state.selectedTrainer) {
//       case "binary_svm":
//         trainer = new SVMTrainer();
//         break;
//       case "knn":
//         trainer = new KNNTrainer();
//         break;
//       default:
//         trainer = new SVMTrainer();
//     }
//
// }

let trainingState = {};
const init = () => {
  const state = store.getState();
  let trainer;
  switch (state.selectedTrainer) {
    case "binary_svm":
      trainer = new SVMTrainer();
      break;
    case "knn":
      trainer = new KNNTrainer();
      break;
    default:
      trainer = new SVMTrainer();
  }
  trainingState.trainer = trainer;
  buildOptionNumberKeysByFeature(state);

  /* Builds a hash that maps a feature's categorical options to numbers because
    the ML algorithms only accepts numerical inputs.
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
  /* Builds a hash that maps selected categorical features to their option-
    number keys and dispatches that hash to the Redux store.
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

  const buildOptionNumberKeysByFeature = state => {
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
  };
  /* For feature columns that store categorical data, looks up the value
    associated with a row's specific option for a given feature; otherwise
    returns the option converted to an integer for feature columns that store
    continuous data.
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

  /* Builds an array containing integer values associated with each feature's
    specific option in a given row.
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

  extractLabel = row => {
    this.convertValue(this.state.labelColumn, row);
  };

  prepareTrainingData = () => {
    store.dispatch(
      setTrainingExamples(this.state.data.map(this.extractExamples))
    );
    store.dispatch(setTrainingLabels(this.state.data.map(this.extractLabel)));
  };

  prepareTestData = () => {
    let testValues = [];
    this.state.selectedFeatures.forEach(feature =>
      testValues.push(this.convertValue(feature, this.state.testData))
    );
    return testValues;
  };
};

const onClickTrain = () => {
  trainingState.trainer.startTraining();
};

const onClickPredict = () => {
  const testValues = this.prepareTestData();
  trainingState.trainer.predict(testValues);
};

export default {
  init,
  onClickTrain,
  onClickPredict
};
