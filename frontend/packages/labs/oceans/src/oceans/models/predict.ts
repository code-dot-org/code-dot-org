import {generateOcean} from '../../utils/generateOcean';
import {AppMode, Modes} from '../constants';
import {$time, finishLoading, reportPageView} from '../helpers';
import type {State} from '../state';
import {getState, setState} from '../state';

/**
 * Initialize the predict model: train the classifier and populate fishData.
 *
 * @returns Promise resolving when training and fish generation are complete.
 */
export const init = (): Promise<void> => {
  const state = getState();

  // Conditionally display a loading spinner during initialization, as
  // state.trainer.train() can block the main thread for multiple seconds.
  const setLoadingSpinner = [
    AppMode.FishShort as string,
    AppMode.FishLong as string,
  ].includes(state.appMode!);
  let startTime: number | undefined;
  let trainingDelayTime: number;
  if (setLoadingSpinner) {
    startTime = $time();
    trainingDelayTime = 500;
    setState({currentMode: Modes.IntermediateLoading});

    // Manually send a GA event for Modes.IntermediateLoading.
    reportPageView('intermediateLoading');
  } else {
    trainingDelayTime = 0;
  }

  // It's possible for state.trainer.train() to block the main thread for
  // several seconds; delaying it gives React time to render the loading UI.
  return new Promise<void>(resolve =>
    setTimeout(resolve, trainingDelayTime),
  ).then(() => {
    // Manually send a GA event for Modes.Predicting.
    reportPageView('predicting');

    const trainer = getState().trainer as unknown as {
      train: () => void;
    };
    trainer.train();

    let oceanData = getState().fishData.slice() as ReturnType<
      typeof generateOcean
    >;
    if (getState().appMode === AppMode.CreaturesVTrashDemo) {
      oceanData = ([] as ReturnType<typeof generateOcean>).concat(
        generateOcean(4, 0, true, true, false),
        generateOcean(3, 4, false, false, true),
      );
    } else if (getState().appMode === AppMode.FishLong) {
      oceanData = generateOcean(500);
    } else {
      oceanData = generateOcean(100);
    }

    if (setLoadingSpinner) {
      finishLoading(startTime!, () => onLoadComplete(oceanData));
    } else {
      onLoadComplete(oceanData);
    }
  });
};

/**
 * Transition into Predicting mode with the generated fish data.
 *
 * @param oceanData - The generated ocean objects to display during prediction.
 */
const onLoadComplete = (oceanData: ReturnType<typeof generateOcean>): void => {
  // Reset animation state so the Run button renders immediately regardless
  // of whether a Training animation was mid-flight when Continue was clicked.
  setState({
    fishData: oceanData,
    currentMode: Modes.Predicting,
    isRunning: false,
    isPaused: false,
  });
};

/**
 * Predict the class of a single fish at the given index.
 *
 * @param state - Current lab state providing fishData and trainer.
 * @param idx - Index into state.fishData of the fish to predict.
 * @returns Promise resolving to the prediction result object.
 */
export const predictFish = (state: State, idx: number): Promise<unknown> => {
  return new Promise(resolve => {
    const fish = (state.fishData as unknown[])[idx];
    const trainer = state.trainer as unknown as {
      predict: (f: unknown) => Promise<unknown>;
    };
    return trainer.predict(fish).then(prediction => {
      (fish as {setResult: (r: unknown) => void}).setResult(prediction);
      resolve(prediction);
    });
  });
};
