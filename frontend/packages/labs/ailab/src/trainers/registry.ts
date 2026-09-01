/*
  Which trainer family a level selected, and which trainer id that family
  records in a saved model.

  This module holds no trainer classes. `redux.ts` needs the trainer id, and
  the classes import `redux.ts` for its actions.
*/

import {
  ClassificationTrainer,
  RegressionTrainer,
  TreeClassificationTrainer,
  TreeRegressionTrainer,
} from '../constants';
import {isRegression} from '../helpers/columnDetails';
import type {RootState} from '../redux';

import type {TrainerFamily, TrainerId} from './types';

export const DEFAULT_TRAINER_FAMILY: TrainerFamily = 'knn';

const trainerIdsByFamily: Record<
  TrainerFamily,
  {classify: TrainerId; regress: TrainerId}
> = {
  knn: {
    classify: ClassificationTrainer,
    regress: RegressionTrainer,
  },
  decisionTree: {
    classify: TreeClassificationTrainer,
    regress: TreeRegressionTrainer,
  },
};

export function getTrainerFamily(state: RootState): TrainerFamily {
  const selected = state.mode?.trainer;
  if (!selected) {
    return DEFAULT_TRAINER_FAMILY;
  }
  if (!Object.prototype.hasOwnProperty.call(trainerIdsByFamily, selected)) {
    console.warn(
      `AI Lab: level mode names unknown trainer "${selected}"; using ${DEFAULT_TRAINER_FAMILY}.`,
    );
    return DEFAULT_TRAINER_FAMILY;
  }
  return selected as TrainerFamily;
}

export function getTrainerId(state: RootState): TrainerId {
  const ids = trainerIdsByFamily[getTrainerFamily(state)];
  return isRegression(state) ? ids.regress : ids.classify;
}
