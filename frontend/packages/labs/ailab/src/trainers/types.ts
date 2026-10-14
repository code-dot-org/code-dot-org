import type {Store} from 'redux';

import type {
  ClassificationTrainer,
  RegressionTrainer,
  TreeClassificationTrainer,
  TreeRegressionTrainer,
} from '../constants';
import type {RootState} from '../redux';
import type {
  AilabProject,
  HistoricResult,
  Hyperparameters,
  TrainedModel,
} from '../types';

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

/* What a trainer makes of the data it was given. */
export interface TrainerOutput {
  trainedModel: TrainedModel;
  hyperparameters: Hyperparameters;
  historicResult: HistoricResult;
}

/* What one training run produces. */
export interface TrainingRun extends TrainerOutput {
  accuracyCheckRowIndices: number[];
}

export interface Trainer {
  startTraining(): TrainerOutput | undefined;
  rebuild(hyperparameters: Hyperparameters): TrainerOutput | undefined;
  predict(trainedModel: TrainedModel | undefined, testValues: number[]): void;
  batchPredict(
    trainedModel: TrainedModel | undefined,
    examples: number[][],
  ): (number | string)[];
}

export interface TrainerConstructor {
  new (store: Store<RootState>, project: AilabProject): Trainer;
}
