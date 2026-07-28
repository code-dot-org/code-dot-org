/*
  Functions for logging analytics metrics.
*/
import type {RootState} from '../redux';

import {getPercentCorrect} from './accuracy';
import {isUserUploadedDataset} from './datasetDetails';

function getModelMetrics(state: RootState): Record<string, unknown> {
  const modelMetrics: Record<string, unknown> = {};
  modelMetrics.userUploaded = isUserUploadedDataset(state);
  modelMetrics.datasetName = state.metadata.name;
  modelMetrics.features = state.selectedFeatures;
  modelMetrics.label = state.labelColumn;
  modelMetrics.accuracy = getPercentCorrect(state);
  return modelMetrics;
}

type MetricsLogger = (action: string, details: Record<string, unknown>) => void;

let metricsLogger: MetricsLogger;

export function setMetricsLogger(logger: MetricsLogger) {
  metricsLogger = logger;
}

export function logMetric(action: string, state: RootState): void {
  if (metricsLogger) {
    metricsLogger(action, getModelMetrics(state));
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
