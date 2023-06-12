import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';

/**
 * Logging and reporting functions for Music Lab
 */

export function logInfo(message: string | object) {
  MetricsReporter.logInfo(decorateMessage(message));
}

export function logWarning(message: string | object) {
  MetricsReporter.logWarning(decorateMessage(message));
}

export function logError(message: string | object | Error) {
  if (message instanceof Error) {
    message = {
      error: message.toString(),
      stack: message.stack,
    };
  }
  MetricsReporter.logError(decorateMessage(message));
}

/**
 * Decorate log messages with common Music Lab fields
 */
function decorateMessage(message: string | object): object {
  if (typeof message === 'string') {
    message = {
      message,
    };
  }

  return {
    ...message,
    lab: 'music',
  };
}
