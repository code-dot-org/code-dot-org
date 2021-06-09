import { isUserUploadedDataset, getPercentCorrect } from "./redux";
function getModelMetrics(state) {
  const modelMetrics = {};
  modelMetrics.userUploaded = isUserUploadedDataset(state);
  modelMetrics.datasetName = state.metadata.name;
  modelMetrics.features = state.selectedFeatures;
  modelMetrics.label = state.labelColumn;
  modelMetrics.accuracy = getPercentCorrect(state);
  return modelMetrics;
}

export function logFirehoseMetric(action, state) {
  return state.firehoseMetricsLogger(action, getModelMetrics(state));
}

export function reportPanelView(panel) {
  if (!window.ga || !panel) {
    return;
  }
  // Record each panel as a different page view in Google Analytics.
  const syntheticPagePath = window.location.pathname + '/' + panel;
  window.ga('set', 'page', syntheticPagePath);
  window.ga('send', 'pageview');
}
