import SVMTrainer from "./SVMTrainer";

const onClickTrain = () => {
  const trainer = new SVMTrainer();
  trainer.startTraining();
};

export default {
  onClickTrain
};
