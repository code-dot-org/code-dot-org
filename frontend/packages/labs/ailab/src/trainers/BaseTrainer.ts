/*
  The training flow shared by every trainer: sweep a list of candidate
  hyperparameters, keep the model that grades best, and store it.

  A subclass supplies only what differs between algorithms — which candidates
  to try, how to build a model from one, and how to name it for the saved
  model card.
*/

import type {Store} from 'redux';

import {
  gradeAccuracy,
  getGradeOptions,
  getPercentCorrect,
} from '../helpers/accuracy';
import {logMetric} from '../helpers/metrics';
import type {RootState} from '../redux';
import {
  setHyperparameters,
  setTrainedModel,
  setPrediction,
  setAccuracyCheckPredictedLabels,
  setHistoricResult,
} from '../redux';
import type {Hyperparameters, TrainedModel} from '../types';

import type {Trainer} from './types';

export interface OptimalModelDetails<Candidate> {
  model: TrainedModel;
  predictedLabels: (number | string)[];
  candidate: Candidate;
}

export default abstract class BaseTrainer<Candidate> implements Trainer {
  protected readonly store: Store<RootState>;

  constructor(store: Store<RootState>) {
    this.store = store;
  }

  protected abstract candidates(state: RootState): Candidate[];

  protected abstract buildModel(
    state: RootState,
    candidate: Candidate,
  ): TrainedModel;

  protected abstract hyperparameters(candidate: Candidate): Hyperparameters;

  startTraining(): void {
    const state = this.store.getState();

    const optimalModel = this.getOptimalModelDetails(state);

    if (!optimalModel) {
      return;
    }

    this.storeTrainedModel(optimalModel);

    const trainedState = this.store.getState();

    logMetric('train-model', trainedState);

    this.storeHistoricResult(trainedState);
  }

  getOptimalModelDetails(
    state: RootState,
  ): OptimalModelDetails<Candidate> | undefined {
    const gradeOptions = getGradeOptions(state);
    let best: OptimalModelDetails<Candidate> | undefined;
    let bestAccuracy = -1;

    this.candidates(state).forEach((candidate: Candidate) => {
      const model = this.buildModel(state, candidate);
      const predictedLabels = this.predictRows(
        model,
        state.accuracyCheckExamples,
      );
      const {percentCorrect} = gradeAccuracy(
        predictedLabels,
        state.accuracyCheckLabels,
        gradeOptions,
      );
      const accuracy = parseFloat(percentCorrect);

      // Strict, so a tie keeps the candidate a subclass listed first.
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        best = {model, predictedLabels, candidate};
      } else if (!best) {
        best = {model, predictedLabels, candidate};
      }
    });

    return best;
  }

  // ml-knn throws on an empty matrix; ml-cart returns no predictions.
  private predictRows(
    model: TrainedModel,
    rows: number[][],
  ): (number | string)[] {
    return rows.length > 0 ? model.predict(rows) : [];
  }

  batchPredict(accuracyCheckExamples: number[][]): (number | string)[] {
    const {trainedModel} = this.store.getState();

    if (!trainedModel) {
      return [];
    }

    const predictedLabels = this.predictRows(
      trainedModel,
      accuracyCheckExamples,
    );
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

  storeTrainedModel(optimalModel: OptimalModelDetails<Candidate>): void {
    this.store.dispatch(
      setHyperparameters(this.hyperparameters(optimalModel.candidate)),
    );
    this.store.dispatch(
      setAccuracyCheckPredictedLabels(optimalModel.predictedLabels),
    );
    this.store.dispatch(setTrainedModel(optimalModel.model));
  }

  storeHistoricResult(state: RootState): void {
    const accuracy = getPercentCorrect(state);
    this.store.dispatch(
      setHistoricResult(state.labelColumn!, state.selectedFeatures, accuracy),
    );
  }
}
