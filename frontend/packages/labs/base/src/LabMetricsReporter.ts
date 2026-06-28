import {
  logger,
  metrics,
  recordError,
} from '@code-dot-org/core/plugins/observability';

interface ReportingProperties {
  channelId?: string;
  appName?: string;
  currentLevelId?: string | number;
  scriptId?: number;
}

class LabMetricsReporter {
  private commonProperties: ReportingProperties = {};

  constructor(initialProperties?: ReportingProperties) {
    this.commonProperties = initialProperties || {};
  }

  updateProperties(properties: ReportingProperties) {
    this.commonProperties = {...this.commonProperties, ...properties};
  }

  logInfo(message: string | object) {
    const decorated = this.decorateMessage(message);
    logger.info(typeof message === 'string' ? message : 'lab.info', decorated);
  }

  logWarning(message: string | object) {
    const decorated = this.decorateMessage(message);
    logger.warn(typeof message === 'string' ? message : 'lab.warn', decorated);
  }

  logError(errorMessage: string, error?: Error, details?: object) {
    recordError(error ?? new Error(errorMessage), {
      ...this.commonProperties,
      errorMessage,
      error: error?.stack || error?.message,
      details,
    });
  }

  reportLoadTime(metricName: string, loadTimeMs: number) {
    metrics.distribution(metricName, loadTimeMs, this.getCommonAttributes());
  }

  incrementCounter(metricName: string, details?: object) {
    metrics.count(metricName, 1, {
      ...this.getCommonAttributes(),
      ...(details || {}),
    });
  }

  reportSevereError() {
    metrics.count('SevereError', 1, this.getCommonAttributes());
  }

  reset() {
    this.commonProperties = {};
  }

  private decorateMessage(message: string | object): Record<string, unknown> {
    const obj = typeof message === 'string' ? {message} : message;
    return {...obj, ...this.commonProperties};
  }

  private getCommonAttributes(): Record<string, unknown> {
    const {appName, channelId, currentLevelId, scriptId} =
      this.commonProperties;
    return {
      ...(appName && {AppName: appName}),
      ...(channelId && {ChannelId: channelId}),
      ...(currentLevelId != null && {LevelId: String(currentLevelId)}),
      ...(scriptId != null && {ScriptId: String(scriptId)}),
    };
  }
}

export default LabMetricsReporter;
