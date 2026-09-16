import type {Store} from 'redux';

import type {ClassificationTrainer, RegressionTrainer} from '../constants';
import type {RootState} from '../redux';

/*
  A level selects a trainer family. The label column type then decides
  classification or regression, and a TrainerId names that pair.

  The two types are deliberately different in kind. TrainerFamily keys the
  dispatch table in ./index, so it must stay total and gains a second family
  only when a second trainer exists. TrainerId is the string that a saved
  model carries and that apps/src/MLTrainers.js reads, so all four ids are
  declared now and none of them has to change later.
*/
export type TrainerFamily = 'knn';

export type TrainerId =
  | typeof ClassificationTrainer
  | typeof RegressionTrainer
  | 'treeClassify'
  | 'treeRegress';

export interface Trainer {
  startTraining(): void;
  predict(testValues: number[]): void;
  batchPredict(examples: number[][]): (number | string)[];
}

export interface TrainerConstructor {
  new (store: Store<RootState>): Trainer;
}
