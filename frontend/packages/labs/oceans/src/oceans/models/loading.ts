import {initFishData} from '../../utils/fishData';
import KNNTrainer from '../../utils/KNNTrainer';
import {AppMode, Modes} from '../constants';
import {getAppMode, $time, finishLoading} from '../helpers';
import {toMode} from '../modeTransition';
import {initRenderer} from '../renderer';
import {getState, setState} from '../state';

/**
 * Initialize the loading model: configure trainer, load images, and transition
 * to the appropriate first mode once assets are ready.
 *
 * @returns Promise resolving when initialization and image loading are complete.
 */
export const init = async (): Promise<void> => {
  const startTime = $time();

  const [appModeBase] = getAppMode(getState());

  const appModeBaseStr = appModeBase as string;
  const loadTrashImages = [
    AppMode.FishVTrash as string,
    AppMode.CreaturesVTrash as string,
    AppMode.CreaturesVTrashDemo as string,
  ].includes(appModeBaseStr);
  const loadCreatureImages = [
    AppMode.CreaturesVTrash as string,
    AppMode.CreaturesVTrashDemo as string,
  ].includes(appModeBaseStr);

  if (appModeBase === AppMode.CreaturesVTrashDemo) {
    const trainer = new KNNTrainer(
      (oceanObj: unknown) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (oceanObj as {getTensor: () => unknown}).getTensor() as any,
    );
    setState({trainer, word: 'fish'});
  }

  setState({loadTrashImages, loadCreatureImages});

  initFishData();
  await initRenderer();

  let mode: number;
  if (appModeBase === 'instructions') {
    mode = Modes.Instructions;
  } else if (
    [AppMode.FishVTrash as string, AppMode.CreaturesVTrash as string].includes(
      appModeBaseStr,
    )
  ) {
    mode = Modes.Training;
  } else if (appModeBase === AppMode.CreaturesVTrashDemo) {
    mode = Modes.Predicting;
  } else {
    mode = Modes.Words;
  }

  finishLoading(startTime, () => toMode(mode));
};
