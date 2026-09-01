/*
  The parts of training that do not depend on the algorithm: the store
  handling, the sweep grading, and prediction from the stored model.
*/

import type {Store} from 'redux';

import {
  gradeAccuracy,
  getGradeAccuracyOptions,
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
import type {TrainedModel} from '../types';

import type {Trainer, TrainingResult} from './types';

export interface GradedCandidate {
  predictedLabels: (number | string)[];
  accuracy: number;
}

export default abstract class BaseTrainer implements Trainer {
  protected store: Store<RootState>;
  protected model: TrainedModel | undefined;

  constructor(store: Store<RootState>) {
    this.store = store;
  }

  /*
    Train over the prepared data in `state` and return the model the trainer
    chose, that model's predictions for the accuracy-check examples, and the
    hyperparameters it settled on.
  */
  protected abstract train(state: RootState): TrainingResult;

  startTraining(store: Store<RootState>): void {
    this.store = store;

    const result = this.train(store.getState());
    this.model = result.model;

    store.dispatch(setHyperparameters(result.hyperparameters));
    store.dispatch(setAccuracyCheckPredictedLabels(result.predictedLabels));
    store.dispatch(setTrainedModel(result.model));

    const trainedState = store.getState();
    logMetric('train-model', trainedState);
    this.storeHistoricResult(store, trainedState);
  }

  predict(testValues: number[]): void {
    const state = this.store.getState();

    if (state.trainedModel) {
      const predictions = state.trainedModel.predict([testValues]);
      this.store.dispatch(setPrediction(predictions[0]));
    }
  }

  batchPredict(examples: number[][]): (number | string)[] {
    if (!this.model) {
      return [];
    }
    return this.model.predict(examples);
  }

  protected gradeCandidate(
    state: RootState,
    model: TrainedModel,
  ): GradedCandidate {
    const predictedLabels = model.predict(state.accuracyCheckExamples);
    const {percentCorrect} = gradeAccuracy(
      predictedLabels,
      state.accuracyCheckLabels,
      getGradeAccuracyOptions(state),
    );
    return {predictedLabels, accuracy: percentCorrect};
  }

  private storeHistoricResult(
    store: Store<RootState>,
    state: RootState,
  ): void {
    store.dispatch(
      setHistoricResult(
        state.labelColumn!,
        state.selectedFeatures,
        getPercentCorrect(state),
      ),
    );
  }
}
