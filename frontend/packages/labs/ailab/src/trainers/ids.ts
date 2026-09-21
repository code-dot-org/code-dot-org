/*
  The trainer id that a saved model records.

  This module imports no trainer class. `redux.ts` needs the id, and every
  trainer class imports `redux.ts` for its actions, so putting the mapping in
  its own module is what keeps that from being an import cycle.
*/

import {ClassificationTrainer, RegressionTrainer} from '../constants';
import {isRegression} from '../helpers/columnDetails';
import type {RootState} from '../redux';

import type {TrainerFamily, TrainerId} from './types';

export const DEFAULT_TRAINER_FAMILY: TrainerFamily = 'knn';

const idsByFamily: Record<
  TrainerFamily,
  {classify: TrainerId; regress: TrainerId}
> = {
  knn: {classify: ClassificationTrainer, regress: RegressionTrainer},
};

// Reads no level configuration yet, so every level gets the default family.
export function getTrainerId(state: RootState): TrainerId {
  const ids = idsByFamily[DEFAULT_TRAINER_FAMILY];
  return isRegression(state) ? ids.regress : ids.classify;
}
