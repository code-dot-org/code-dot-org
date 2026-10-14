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

import type {Trainer, TrainerOutput} from './types';

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

  // The inverse of hyperparameters(), so a saved run can be rebuilt exactly.
  protected abstract candidateFor(hyperparameters: Hyperparameters): Candidate;

  startTraining(): TrainerOutput | undefined {
    const optimalModel = this.getOptimalModelDetails(this.store.getState());

    if (!optimalModel) {
      return undefined;
    }

    const run = this.recordModel(optimalModel);
    const trainedState = this.store.getState();

    /*
      Only a run the student asked for is worth a metric. A pretrained level
      trains on load, and rebuild() refits a saved one, so neither reports.
    */
    if (!trainedState.mode?.pretrained) {
      logMetric('train-model', trainedState, this.project);
    }

    return run;
  }

  /*
    Builds the one model the given hyperparameters describe, rather than
    sweeping for the best. A saved project records what its run settled on, and
    re-running the sweep could answer differently if the candidates ever change.
  */
  rebuild(hyperparameters: Hyperparameters): TrainerOutput | undefined {
    const state = this.store.getState();
    const candidate = this.candidateFor(hyperparameters);
    const model = this.buildModel(state, candidate);

    return this.recordModel({
      model,
      predictedLabels: this.predictRows(model, state.accuracyCheckExamples),
      candidate,
    });
  }

  // Stores what grading a model needs, then describes the run it belongs to.
  private recordModel(details: OptimalModelDetails<Candidate>): TrainerOutput {
    this.store.dispatch(
      setAccuracyCheckPredictedLabels(details.predictedLabels),
    );

    return {
      trainedModel: details.model,
      hyperparameters: this.hyperparameters(details.candidate),
      historicResult: this.buildHistoricResult(this.store.getState()),
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
