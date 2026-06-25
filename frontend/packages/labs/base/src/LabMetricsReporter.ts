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

  logError(errorMessage: string, error?: Error) {
    recordError(error ?? new Error(errorMessage), {
      ...this.commonProperties,
      errorMessage,
    });
  }

  reportLoadTime(metricName: string, loadTimeMs: number) {
    metrics.distribution(metricName, loadTimeMs, {
      ...this.getCommonAttributes(),
    });
  }

  incrementCounter(metricName: string) {
    metrics.count(metricName, 1, {...this.getCommonAttributes()});
  }

  reportSevereError() {
    metrics.count('SevereError', 1, {...this.getCommonAttributes()});
  }

  reset() {
    this.commonProperties = {};
  }

  private decorateMessage(message: string | object): Record<string, unknown> {
    const obj = typeof message === 'string' ? {message} : message;
    return {...obj, ...this.commonProperties};
  }

  private getCommonAttributes(): Record<string, unknown> {
    const attrs: Record<string, unknown> = {};
    if (this.commonProperties.appName) {
      attrs.AppName = this.commonProperties.appName;
    }
    return attrs;
  }
}

export default LabMetricsReporter;
