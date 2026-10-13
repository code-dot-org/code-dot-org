/*
  Functions for logging analytics metrics.
*/
import type {RootState} from '../redux';
import {getTrainerId} from '../trainers/ids';
import type {AilabProject} from '../types';

import {getPercentCorrect} from './accuracy';
import {isUserUploadedDataset} from './datasetDetails';

function getModelMetrics(
  state: RootState,
  project: AilabProject,
): Record<string, unknown> {
  const modelMetrics: Record<string, unknown> = {};
  modelMetrics.userUploaded = isUserUploadedDataset(state);
  modelMetrics.datasetName = state.metadata.name;
  modelMetrics.features = project.selectedFeatures;
  modelMetrics.label = project.labelColumn;
  modelMetrics.accuracy = getPercentCorrect(state, project);
  // The same id the saved model records, so the two can be joined.
  modelMetrics.trainer = getTrainerId(state, project);
  return modelMetrics;
}

type MetricsLogger = (action: string, details: Record<string, unknown>) => void;

let metricsLogger: MetricsLogger;

export function setMetricsLogger(logger: MetricsLogger) {
  metricsLogger = logger;
}

export function logMetric(
  action: string,
  state: RootState,
  project: AilabProject,
): void {
  if (metricsLogger) {
    metricsLogger(action, getModelMetrics(state, project));
  }
}

export function reportPanelView(panel: string): void {
  if (!window.ga || !panel) {
    return;
  }
  // Record each panel as a different page view in Google Analytics.
  const syntheticPagePath = window.location.pathname + '/' + panel;
  window.ga('set', 'page', syntheticPagePath);
  window.ga('send', 'pageview');
}
