import {generateOcean} from '../../utils/generateOcean';
import KNNTrainer from '../../utils/KNNTrainer';
import SVMTrainer from '../../utils/SVMTrainer';
import {ClassType, AppMode} from '../constants';
import I18n from '../i18n';
import {setState, getState} from '../state';

/** Initialize the training model: set up the trainer and seed the fish pool. */
const init = (): void => {
  const state = getState();

  let trainer = state.trainer as KNNTrainer | SVMTrainer | null;
  if (!trainer) {
    if (
      [AppMode.FishShort as string, AppMode.FishLong as string].includes(
        state.appMode!,
      )
    ) {
      trainer = new SVMTrainer(((fish: unknown) =>
        (fish as {getKnnData: () => number[]}).getKnnData()) as (
        input: unknown,
      ) => number[]);
    } else {
      trainer = new KNNTrainer(
        (oceanObj: unknown) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (oceanObj as {getTensor: () => unknown}).getTensor() as any,
      );
    }
  }

  if (state.appMode === AppMode.FishVTrash) {
    setState({
      word: I18n.t('fish'),
      trainingQuestion: I18n.t('isThisAFish'),
    });
  }
  if (state.appMode === AppMode.CreaturesVTrash) {
    setState({
      word: I18n.t('waterCreature'),
      trainingQuestion: I18n.t('doesThisBelongInWater'),
    });
  }

  setState({
    fishData: generateOcean(100),
    trainingIndex: 0,
    trainer,
    isRunning: true,
  });
};

/**
 * Record whether the user liked or disliked the current fish and advance the queue.
 *
 * @param doesLike - True if the user classified the fish as liked.
 * @returns True if the classification was recorded; false if animation is in progress.
 */
const onClassifyFish = (doesLike: boolean): boolean => {
  const state = getState();

  // No-op if animation is currently in progress.
  if (state.isRunning) {
    return false;
  }

  const classId = doesLike ? ClassType.Like : ClassType.Dislike;
  (
    state.trainer as unknown as {
      addTrainingExample: (fish: unknown, classId: number) => void;
    }
  ).addTrainingExample(state.fishData[state.trainingIndex], classId);

  let fishData = [...state.fishData];
  if (state.trainingIndex > state.fishData.length - 5) {
    fishData = fishData.concat(generateOcean(100, fishData.length));
  }

  if (doesLike) {
    const newValue = getState().yesCount + 1;
    setState({yesCount: newValue});
  } else {
    const newValue = getState().noCount + 1;
    setState({noCount: newValue});
  }

  setState({
    trainingIndex: state.trainingIndex + 1,
    fishData,
    isRunning: true,
  });

  return true;
};

export default {
  init,
  onClassifyFish,
};
