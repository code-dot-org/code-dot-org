import type {Store} from 'redux';

import type {RootState} from '../redux';

import DecisionTreeTrainer from './DecisionTreeTrainer';
import {getTrainerFamily} from './ids';
import KNNTrainer from './KNNTrainer';
import type {Trainer, TrainerConstructor, TrainerFamily} from './types';

const trainersByFamily: Record<TrainerFamily, TrainerConstructor> = {
  knn: KNNTrainer,
  decisionTree: DecisionTreeTrainer,
};

export function buildTrainer(store: Store<RootState>): Trainer {
  return new trainersByFamily[getTrainerFamily()](store);
}
