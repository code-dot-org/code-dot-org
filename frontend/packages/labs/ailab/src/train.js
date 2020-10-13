/* Generic machine learning handlers that route to the selected trainer. */

import SVMTrainer from "./SVMTrainer";

export const availableTrainers = {
  binary_svm: {
    name: "Binary SVM",
    description:
      "Uses the Support Vector Machine algorithm to classify an example as one of two options. Features can be categorical or continuous.",
    mlType: "binary classification"
  },
  knn: {
    name: "KNN",
    description:
      "Uses the K-Nearest Neighbor algorithm to classify an example as one of N options.  Features can be categorical or continuous. K is currently set to 2, but we can make this is customizable.",
    mlTypes: "multi-classification"
  }
};

let trainingState = {};
const init = () => {
  let trainer = new SVMTrainer();
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
