/* Training and prediction using a CART decision tree from
https://github.com/mljs/decision-tree-cart */

import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';

import {isRegression} from '../helpers/columnDetails';
import type {RootState} from '../redux';
import type {Hyperparameters, TrainedModel} from '../types';

import BaseTrainer from './BaseTrainer';

const CANDIDATE_MAX_DEPTHS = [1, 2, 3, 5, 8];

// ml-cart's own default, passed explicitly so the saved model records it.
const MIN_NUM_SAMPLES = 3;

export default class DecisionTreeTrainer extends BaseTrainer<number> {
  /*
    A tree can only reach a depth the training set can fill, so candidates
    deeper than that retrain the same tree. Without a set to grade against,
    every candidate ties and the shallowest is the one worth building.
  */
  protected candidates(state: RootState): number[] {
    if (state.accuracyCheckExamples.length === 0) {
      return CANDIDATE_MAX_DEPTHS.slice(0, 1);
    }

    const reachableDepth = Math.max(
      1,
      Math.ceil(Math.log2(state.trainingExamples.length || 1)),
    );
    return CANDIDATE_MAX_DEPTHS.filter(
      (maxDepth: number) => maxDepth <= reachableDepth,
    );
  }

  protected buildModel(state: RootState, maxDepth: number): TrainedModel {
    const options = {maxDepth, minNumSamples: MIN_NUM_SAMPLES};
    const tree = isRegression(state)
      ? new DecisionTreeRegression(options)
      : new DecisionTreeClassifier(options);
    tree.train(state.trainingExamples, state.trainingLabels.map(Number));
    return tree;
  }

  protected hyperparameters(maxDepth: number): Hyperparameters {
    return {maxDepth, minNumSamples: MIN_NUM_SAMPLES};
  }
}
