/*
  The training flow shared by every trainer: sweep a list of candidate
  hyperparameters, keep the model that grades best, and return it.

  A subclass supplies only what differs between algorithms — which candidates
  to try, how to build a model from one, and how to name it for the saved
  model card.
*/

import type {Store} from 'redux';

import {
  gradeAccuracy,
  getCorrectCount,
  getGradeOptions,
  getPercentCorrect,
} from '../helpers/accuracy';
import {logMetric} from '../helpers/metrics';
import type {RootState} from '../redux';
import {setPrediction, setAccuracyCheckPredictedLabels} from '../redux';
import type {
  AilabProject,
  HistoricResult,
  Hyperparameters,
  TrainedModel,
} from '../types';

import type {Trainer, TrainingRun} from './types';

export interface OptimalModelDetails<Candidate> {
  model: TrainedModel;
  predictedLabels: (number | string)[];
  candidate: Candidate;
}

export default abstract class BaseTrainer<Candidate> implements Trainer {
  protected readonly store: Store<RootState>;
  protected readonly project: AilabProject;

  constructor(store: Store<RootState>, project: AilabProject) {
    this.store = store;
    this.project = project;
  }

  protected abstract candidates(state: RootState): Candidate[];

  protected abstract buildModel(
    state: RootState,
    candidate: Candidate,
  ): TrainedModel;

  protected abstract hyperparameters(candidate: Candidate): Hyperparameters;

  startTraining(): TrainingRun | undefined {
    const state = this.store.getState();

    const optimalModel = this.getOptimalModelDetails(state);

    if (!optimalModel) {
      return undefined;
    }

    this.store.dispatch(
      setAccuracyCheckPredictedLabels(optimalModel.predictedLabels),
    );

    const trainedState = this.store.getState();

    if (!trainedState.mode?.pretrained) {
      logMetric('train-model', trainedState, this.project);
    }

    return {
      trainedModel: optimalModel.model,
      hyperparameters: this.hyperparameters(optimalModel.candidate),
      historicResult: this.buildHistoricResult(trainedState),
    };
  }

  getOptimalModelDetails(
    state: RootState,
  ): OptimalModelDetails<Candidate> | undefined {
    const gradeOptions = getGradeOptions(state, this.project);
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

  batchPredict(
    trainedModel: TrainedModel | undefined,
    accuracyCheckExamples: number[][],
  ): (number | string)[] {
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

  predict(trainedModel: TrainedModel | undefined, testValues: number[]): void {
    if (trainedModel) {
      const predictions = trainedModel.predict([testValues]);
      this.store.dispatch(setPrediction(predictions[0], testValues));
    }
  }

  buildHistoricResult(state: RootState): HistoricResult {
    const {correct, total} = getCorrectCount(state, this.project);
    return {
      label: this.project.labelColumn!,
      features: this.project.selectedFeatures,
      accuracy: getPercentCorrect(state, this.project),
      correct,
      total,
    };
  }
}
