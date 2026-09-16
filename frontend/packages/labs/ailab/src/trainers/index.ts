import type {Store} from 'redux';

import type {RootState} from '../redux';

import {DEFAULT_TRAINER_FAMILY} from './ids';
import KNNTrainer from './KNNTrainer';
import type {Trainer, TrainerConstructor, TrainerFamily} from './types';

const trainersByFamily: Record<TrainerFamily, TrainerConstructor> = {
  knn: KNNTrainer,
};

// Reads no level configuration yet, so every level gets the default family.
export function buildTrainer(store: Store<RootState>): Trainer {
  return new trainersByFamily[DEFAULT_TRAINER_FAMILY](store);
}
