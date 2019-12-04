import 'idempotent-babel-polyfill';
import {getState, setState} from '../state';
import {generateOcean} from '../../utils/generateOcean';
import {AppMode, Modes} from '../constants';
import {$time, finishLoading, reportPageView} from '../helpers';

export const init = () => {
  const state = getState();

  // Conditionally display a loading spinner during initialiation, as state.trainer.train() operation
  // can take multiple seconds.
  const setLoadingSpinner = [AppMode.FishShort, AppMode.FishLong].includes(
    state.appMode
  );
  let startTime;
  let trainingDelayTime;
  if (setLoadingSpinner) {
    startTime = $time();
    trainingDelayTime = 500;
    setState({currentMode: Modes.IntermediateLoading});

    // Manually send a GA event for Modes.IntermediateLoading.
    reportPageView('intermediateLoading');
  } else {
    trainingDelayTime = 0;
  }

  // It's possible for state.trainer.train() to block the main thread for several
  // seconds, and if it happens immediately it will prevent React from rendering
  // the loading UI first.  If we are going to show the loading spinner, then also
  // delay the beginning of our training.
  setTimeout(() => {
    // Manually send a GA event for Modes.Predicting.
    reportPageView('predicting');

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

    if (setLoadingSpinner) {
      finishLoading(startTime, () => onLoadComplete(fishData));
    } else {
      onLoadComplete(fishData);
    }
  }, trainingDelayTime);
};

const onLoadComplete = fishData => {
  setState({
    fishData,
    currentMode: Modes.Predicting
  });
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
