/* Training and prediction using a CART decision tree from
https://github.com/mljs/decision-tree-cart */

import {DecisionTreeClassifier, DecisionTreeRegression} from 'ml-cart';
import type {Store} from 'redux';

import {
  gradeAccuracy,
  getGradeOptions,
  getPercentCorrect,
} from '../helpers/accuracy';
import {isRegression} from '../helpers/columnDetails';
import {logMetric} from '../helpers/metrics';
import type {RootState} from '../redux';
import {
  setHyperparameters,
  setTrainedModel,
  setPrediction,
  setAccuracyCheckPredictedLabels,
  setHistoricResult,
} from '../redux';
import type {TrainedModel} from '../types';

import type {Trainer} from './types';

export const CANDIDATE_MAX_DEPTHS = [1, 2, 3, 5, 8];

/*
  The library default is 3. AI Lab datasets are a classroom's worth of rows,
  and a minimum leaf size of 3 collapses such a set to a single leaf, which
  then predicts the most frequent label for every input.
*/
export const MIN_NUM_SAMPLES = 1;

type Tree = DecisionTreeClassifier | DecisionTreeRegression;

export interface OptimalTreeDetails {
  model: TrainedModel;
  predictedLabels: (number | string)[];
  maxDepth: number;
}

export default class DecisionTreeTrainer implements Trainer {
  private readonly store: Store<RootState>;
  private tree: Tree | undefined;

  constructor(store: Store<RootState>) {
    this.store = store;
  }

  startTraining(): void {
    const state = this.store.getState();

    const optimalTree = this.getOptimalModelDetails(state);

    this.storeTrainedModel(optimalTree);

    const trainedState = this.store.getState();

    logMetric('train-model', trainedState);

    this.storeHistoricResult(trainedState);
  }

  getOptimalModelDetails(state: RootState): OptimalTreeDetails {
    let bestModel: Tree | undefined;
    let bestPredictedLabels: (number | string)[] = [];
    let bestMaxDepth = -1;
    let bestAccuracy = -1;
    const gradeOptions = getGradeOptions(state);
    const trainingLabels = state.trainingLabels.map(Number);

    CANDIDATE_MAX_DEPTHS.forEach((maxDepth: number) => {
      const model = this.buildTree(state, maxDepth);
      model.train(state.trainingExamples, trainingLabels);
      const predictedLabels = this.predictRows(
        model,
        state.accuracyCheckExamples,
      );
      const {percentCorrect} = gradeAccuracy(
        predictedLabels,
        state.accuracyCheckLabels,
        gradeOptions,
      );
      // Candidates ascend and the comparison is strict, so a tie keeps the
      // shallowest tree. Reordering the candidates or relaxing this to >=
      // would silently lose that rule.
      if (parseFloat(percentCorrect) > bestAccuracy) {
        bestAccuracy = parseFloat(percentCorrect);
        bestMaxDepth = maxDepth;
        bestModel = model;
        bestPredictedLabels = predictedLabels;
      }
    });

    this.tree = bestModel;
    return {
      model: bestModel!,
      predictedLabels: bestPredictedLabels,
      maxDepth: bestMaxDepth,
    };
  }

  private buildTree(state: RootState, maxDepth: number): Tree {
    const options = {maxDepth, minNumSamples: MIN_NUM_SAMPLES};
    return isRegression(state)
      ? new DecisionTreeRegression(options)
      : new DecisionTreeClassifier(options);
  }

  // ml-cart throws on an empty matrix where ml-knn returns no predictions.
  private predictRows(model: Tree, rows: number[][]): (number | string)[] {
    return rows.length > 0 ? model.predict(rows) : [];
  }

  batchPredict(accuracyCheckExamples: number[][]): (number | string)[] {
    if (!this.tree) {
      return [];
    }

    const predictedLabels = this.predictRows(this.tree, accuracyCheckExamples);
    this.store.dispatch(setAccuracyCheckPredictedLabels(predictedLabels));
    return predictedLabels;
  }

  predict(testValues: number[]): void {
    const state = this.store.getState();

    if (state.trainedModel) {
      const predictions = state.trainedModel.predict([testValues]);
      this.store.dispatch(setPrediction(predictions[0]));
    }
  }

  storeTrainedModel(optimalTree: OptimalTreeDetails): void {
    this.store.dispatch(
      setHyperparameters({
        maxDepth: optimalTree.maxDepth,
        minNumSamples: MIN_NUM_SAMPLES,
      }),
    );
    this.store.dispatch(
      setAccuracyCheckPredictedLabels(optimalTree.predictedLabels),
    );
    this.store.dispatch(setTrainedModel(optimalTree.model));
  }

  storeHistoricResult(state: RootState): void {
    const accuracy = getPercentCorrect(state);
    this.store.dispatch(
      setHistoricResult(state.labelColumn!, state.selectedFeatures, accuracy),
    );
  }
}
