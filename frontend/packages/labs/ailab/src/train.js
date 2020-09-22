import SVMTrainer from "./SVMTrainer";

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
