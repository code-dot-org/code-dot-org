/* Training and prediction using a CART decision tree from
https://github.com/mljs/decision-tree-cart */

import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';

import {isRegression} from '../helpers/columnDetails';
import type {RootState} from '../redux';
import type {Hyperparameters, TrainedModel} from '../types';

import BaseTrainer from './BaseTrainer';

const CANDIDATE_MAX_DEPTHS = [1, 2, 3, 5, 8];

export default class DecisionTreeTrainer extends BaseTrainer<number> {
  // Without a set to grade against every candidate ties, so only the
  // shallowest is worth building.
  protected candidates(state: RootState): number[] {
    return state.accuracyCheckExamples.length === 0
      ? CANDIDATE_MAX_DEPTHS.slice(0, 1)
      : CANDIDATE_MAX_DEPTHS;
  }

  protected buildModel(state: RootState, maxDepth: number): TrainedModel {
    const tree = isRegression(state)
      ? new DecisionTreeRegression({maxDepth})
      : new DecisionTreeClassifier({maxDepth});
    tree.train(state.trainingExamples, state.trainingLabels.map(Number));
    return tree;
  }

  protected hyperparameters(maxDepth: number): Hyperparameters {
    return {maxDepth};
  }
}
