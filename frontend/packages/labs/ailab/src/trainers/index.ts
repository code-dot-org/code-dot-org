import type {Store} from 'redux';

import type {RootState} from '../redux';

import DecisionTreeTrainer from './DecisionTreeTrainer';
import KNNTrainer from './KNNTrainer';
import {getTrainerFamily} from './registry';
import type {Trainer, TrainerConstructor, TrainerFamily} from './types';

const trainersByFamily: Record<TrainerFamily, TrainerConstructor> = {
  knn: KNNTrainer,
  decisionTree: DecisionTreeTrainer,
};

export function buildTrainer(store: Store<RootState>): Trainer {
  const family = getTrainerFamily(store.getState());
  return new trainersByFamily[family](store);
}
