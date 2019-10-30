import 'babel-polyfill';
import {setState, getState} from '../state';
import {generateOcean} from '../../utils/generateOcean';

export const init = () => {
  const state = getState();
  const fishData = generateOcean(100, state.loadTrashImages);
  setState({isRunning: true, fishData});
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
