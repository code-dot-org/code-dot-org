import type {Store} from 'redux';

import type {
  ClassificationTrainer,
  RegressionTrainer,
  TreeClassificationTrainer,
  TreeRegressionTrainer,
} from '../constants';
import type {RootState} from '../redux';
import type {HistoricResult, Hyperparameters, TrainedModel} from '../types';

/*
  A level selects a trainer family. The label column type then decides
  classification or regression, and a TrainerId names that pair.

  The two types are deliberately different in kind. TrainerFamily keys the
  dispatch table in ./index, so it must stay total. TrainerId is the string
  that a saved model carries and that apps/src/MLTrainers.js reads, so adding
  a family means teaching that module to load it.
*/
export type {TrainerFamily} from '../types';

export type TrainerId =
  | typeof ClassificationTrainer
  | typeof RegressionTrainer
  | typeof TreeClassificationTrainer
  | typeof TreeRegressionTrainer;

/* What one training run produces, for its caller to put where each piece goes. */
export interface TrainingRun {
  trainedModel: TrainedModel;
  hyperparameters: Hyperparameters;
  historicResult: HistoricResult;
}

export interface Trainer {
  startTraining(): TrainingRun | undefined;
  predict(trainedModel: TrainedModel | undefined, testValues: number[]): void;
  batchPredict(
    trainedModel: TrainedModel | undefined,
    examples: number[][],
  ): (number | string)[];
}

export interface TrainerConstructor {
  new (store: Store<RootState>): Trainer;
}
