/* Training and prediction using a CART decision tree from
https://github.com/mljs/decision-tree-cart */

import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';

import {isRegression} from '../helpers/columnDetails';
import type {RootState} from '../redux';
import type {TrainedModel} from '../types';

import BaseTrainer from './BaseTrainer';
import type {TrainingResult} from './types';

export const CANDIDATE_MAX_DEPTHS = [1, 2, 3, 5, 8];

/*
  Measured against ml-cart 2.1.1: a regression tree refuses a split whose
  squared error is zero, because it gates on `gain > gainThreshold` and on
  `gain !== parentGain`, and the root's parentGain is 0. A perfectly separable
  numerical label therefore yields one leaf that predicts the global mean. No
  constructor option changes this. A regression level needs a label that
  varies within a leaf.
*/


/*
  The library default is 3. AI Lab datasets are a classroom's worth of rows,
  and a minimum leaf size of 3 collapses such a set to a single leaf, which
  predicts the most frequent label for every input.
*/
export const MIN_NUM_SAMPLES = 1;

interface Candidate {
  model: TrainedModel;
  predictedLabels: (number | string)[];
  accuracy: number;
  maxDepth: number;
}

export default class DecisionTreeTrainer extends BaseTrainer {
  protected train(state: RootState): TrainingResult {
    const labels = state.trainingLabels.map(Number);
    let best: Candidate | undefined;

    // The candidates ascend and the comparison is strict, so equal accuracy
    // keeps the shallower tree. A shallow tree is the reason to offer a tree.
    CANDIDATE_MAX_DEPTHS.forEach((maxDepth: number) => {
      const model = this.buildModel(state, maxDepth);
      model.train(state.trainingExamples, labels);
      const {predictedLabels, accuracy} = this.gradeCandidate(state, model);
      if (!best || accuracy > best.accuracy) {
        best = {model, predictedLabels, accuracy, maxDepth};
      }
    });

    return {
      model: best!.model,
      predictedLabels: best!.predictedLabels,
      hyperparameters: {
        maxDepth: best!.maxDepth,
        minNumSamples: MIN_NUM_SAMPLES,
      },
    };
  }

  private buildModel(
    state: RootState,
    maxDepth: number,
  ): DecisionTreeClassifier | DecisionTreeRegression {
    const options = {maxDepth, minNumSamples: MIN_NUM_SAMPLES};
    return isRegression(state)
      ? new DecisionTreeRegression(options)
      : new DecisionTreeClassifier(options);
  }
}
