import 'idempotent-babel-polyfill';
import {getState, setState} from '../state';
import {generateOcean} from '../../utils/generateOcean';
import {AppMode, Modes} from '../constants';
import {$time, finishLoading} from '../helpers';

export const init = () => {
  const state = getState();

  // Conditionally display a loading spinner during initialiation, as state.trainer.train() operation
  // can take multiple seconds.
  const setLoadingSpinner = [AppMode.FishShort, AppMode.FishLong].includes(
    state.appMode
  );
  let startTime;
  if (setLoadingSpinner) {
    startTime = $time();
    setState({currentMode: Modes.IntermediateLoading});
  }

  state.trainer.train();
  let fishData = [];
  if (state.appMode === AppMode.CreaturesVTrashDemo) {
    fishData = fishData.concat(generateOcean(4, 0, true, true, false));
    fishData = fishData.concat(generateOcean(3, 4, false, false, true));
  } else if (state.appMode === AppMode.FishLong) {
    fishData = generateOcean(500);
  } else {
    fishData = generateOcean(100);
  }

  const onLoadComplete = () => {
    setState({
      fishData,
      currentMode: Modes.Predicting
    });
  };

  if (setLoadingSpinner) {
    finishLoading(startTime, onLoadComplete);
  } else {
    onLoadComplete();
  }
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
