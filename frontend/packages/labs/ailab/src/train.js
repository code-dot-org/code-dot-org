/* Generic machine learning handlers that route to the selected trainer. */

import SVMTrainer from "./SVMTrainer";
import { store } from "./index.js";

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
};

const onClickTrain = () => {
  trainingState.trainer.startTraining();
};

const onClickPredict = () => {
  trainingState.trainer.predict();
};

export default {
  init,
  onClickTrain,
  onClickPredict
};
