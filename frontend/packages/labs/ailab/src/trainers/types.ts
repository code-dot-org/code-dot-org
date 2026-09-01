import type {Store} from 'redux';

import type {RootState} from '../redux';
import type {TrainedModel} from '../types';

// A trainer family is what a level selects. The label column type then decides
// classification or regression, which is what a TrainerId names.
export type TrainerFamily = 'knn' | 'decisionTree';

export type TrainerId =
  | 'knnClassify'
  | 'knnRegress'
  | 'treeClassify'
  | 'treeRegress';

export interface TrainingResult {
  model: TrainedModel;
  predictedLabels: (number | string)[];
  hyperparameters: Record<string, number>;
}

export interface Trainer {
  startTraining(store: Store<RootState>): void;
  predict(testValues: number[]): void;
  batchPredict(examples: number[][]): (number | string)[];
}

export interface TrainerConstructor {
  new (store: Store<RootState>): Trainer;
}
