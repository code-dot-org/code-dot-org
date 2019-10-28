import 'babel-polyfill';
import {setState} from '../state';

export const init = () => {
  setState({isRunning: true});
};

export const predictFish = (state, idx) => {
  return new Promise(resolve => {
    const fish = state.fishData[idx];
    state.trainer.predictFromData(fish.knnData).then(prediction => {
      fish.result = prediction;
      resolve(prediction);
    });
  });
};
