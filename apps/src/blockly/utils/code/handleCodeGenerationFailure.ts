import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getStore} from '@cdo/apps/redux';
import {setFailedToGenerateCode} from '@cdo/apps/redux/blockly';

/**
 * Handle a failure to get workspace code by Blockly by updating the
 * redux store and logging the error.
 * We only want to log the error once per failure since getWorkspaceCode
 * gets called many times and the error will be the same every time.
 * @param {MetricEvent} eventName Event name to log
 * @param {Error} error Error thrown by getWorkspaceCode
 */
export function handleCodeGenerationFailure(
  eventName: MetricEvent,
  error: Error
) {
  const store = getStore();
  if (!store.getState().blockly.failedToGenerateCode) {
    store.dispatch(setFailedToGenerateCode(true));
    MetricsReporter.logError({
      event: eventName,
      errorMessage: error.message,
      stackTrace: error.stack,
    });
  }
}
