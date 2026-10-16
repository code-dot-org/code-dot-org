import type {Store} from 'redux';

import type {RootState} from '../redux';
import type {AilabProject} from '../types';

import DecisionTreeTrainer from './DecisionTreeTrainer';
import {getTrainerFamily} from './ids';
import KNNTrainer from './KNNTrainer';
import type {Trainer, TrainerConstructor, TrainerFamily} from './types';

const trainersByFamily: Record<TrainerFamily, TrainerConstructor> = {
  knn: KNNTrainer,
  decisionTree: DecisionTreeTrainer,
};

export function buildTrainer(
  store: Store<RootState>,
  project: AilabProject
): Trainer {
  return new trainersByFamily[getTrainerFamily(store.getState())](
    store,
    project
  );
}
