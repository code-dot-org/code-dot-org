import 'babel-polyfill';
import {setState} from '../state';
import {generateOcean} from '../../utils/generateOcean';

export const init = () => {
  const fishData = generateOcean(100);
  setState({isRunning: true, fishData});
};

export const predictFish = (state, idx) => {
  return new Promise(resolve => {
    const fish = state.fishData[idx];
    state.trainer.predictFromData(fish.getKnnData()).then(prediction => {
      fish.setResult(prediction);
      resolve(prediction);
    });
  });
};
