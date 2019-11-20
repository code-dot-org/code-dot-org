import 'idempotent-babel-polyfill';
import {getState, setState} from '../state';
import {generateOcean} from '../../utils/generateOcean';
import {AppMode} from '../constants';

export const init = () => {
  const state = getState();
  state.trainer.train();
  let fishData = [];
  if (state.appMode === AppMode.CreaturesVTrashDemo) {
    fishData = fishData.concat(generateOcean(4, true, true, false));
    fishData = fishData.concat(generateOcean(3, false, false, true, 4));
  } else {
    fishData = generateOcean(100);
  }
  console.log(state.trainer.summarize(fishData[0].fieldInfos));
  setState({fishData});
};

export const predictFish = (state, idx) => {
  return new Promise(resolve => {
    const fish = state.fishData[idx];

    state.trainer.predict(fish).then(prediction => {
      fish.setResult(prediction);
      resolve(prediction);
    });
  });
};
