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

/*
  The one place the family is chosen. Both the class that trains and the id
  stamped onto the saved model come from this, so they cannot disagree. Reads
  no level configuration yet, so every level gets the default family.
*/
export function getTrainerFamily(): TrainerFamily {
  return DEFAULT_TRAINER_FAMILY;
}

export function getTrainerId(state: RootState): TrainerId {
  const ids = idsByFamily[getTrainerFamily()];
  return isRegression(state) ? ids.regress : ids.classify;
}
