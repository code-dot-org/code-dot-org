/*
  The trainer id that a saved model records.

  This module imports no trainer class. `redux.ts` needs the id, and every
  trainer class imports `redux.ts` for its actions, so putting the mapping in
  its own module is what keeps that from being an import cycle.
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

const idsByFamily: Record<
  TrainerFamily,
  {classify: TrainerId; regress: TrainerId}
> = {
  knn: {classify: ClassificationTrainer, regress: RegressionTrainer},
  decisionTree: {
    classify: TreeClassificationTrainer,
    regress: TreeRegressionTrainer,
  },
};

export function getTrainerFamily(state: RootState): TrainerFamily {
  const family = state.mode?.trainer;
  return typeof family === 'string' && Object.hasOwn(idsByFamily, family)
    ? family
    : DEFAULT_TRAINER_FAMILY;
}

export function getTrainerId(state: RootState): TrainerId {
  const ids = idsByFamily[getTrainerFamily(state)];
  return isRegression(state) ? ids.regress : ids.classify;
}
