import 'babel-polyfill';
import {setState} from '../state';

export const init = () => {
  setState({isRunning: true});
};

export const predictFish = (state, idx) => {
  return new Promise(resolve => {
    const fish = state.fishData[idx];
    state.trainer.predictFromTensor(fish.getKnnData()).then(prediction => {
      fish.setResult(prediction);
      resolve(prediction);
    });
  });
};
