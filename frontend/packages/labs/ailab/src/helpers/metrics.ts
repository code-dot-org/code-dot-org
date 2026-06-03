/*
  Functions for logging analytics metrics via Google Analytics and Firehose.
*/
import {isUserUploadedDataset} from './datasetDetails';
import {getPercentCorrect} from './accuracy';
import {RootState} from '../redux';

function getModelMetrics(state: RootState): Record<string, unknown> {
  const modelMetrics: Record<string, unknown> = {};
  modelMetrics.userUploaded = isUserUploadedDataset(state);
  modelMetrics.datasetName = state.metadata.name;
  modelMetrics.features = state.selectedFeatures;
  modelMetrics.label = state.labelColumn;
  modelMetrics.accuracy = getPercentCorrect(state);
  return modelMetrics;
}

export function logFirehoseMetric(action: string, state: RootState): void {
  if (state.firehoseMetricsLogger) {
    state.firehoseMetricsLogger(action, getModelMetrics(state));
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
