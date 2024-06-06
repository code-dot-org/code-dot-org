import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';
import {MetricDimension} from '@cdo/apps/lib/metrics/types';

/**
 * Properties that this metric reporter will add to log payloads.
 */
interface ReportingProperties {
  channelId?: string;
  appName?: string;
  currentLevelId?: string | number;
  scriptId?: number;
}

/**
 * Metrics reporter for labs.
 */
export default class LabMetricsReporter {
  // Common fields that are added to every log payload.
  private commonProperties: ReportingProperties = {};

  constructor(initialProperties?: ReportingProperties) {
    this.commonProperties = initialProperties || {};
  }

  /**
   * Update common properties that will be added to log payloads.
   * Provided properties will be merged with existing properties,
   * so single properties can be updated without overwriting others.
   */
  public updateProperties(properties: ReportingProperties) {
    this.commonProperties = {...this.commonProperties, ...properties};
  }

  public logInfo(message: string | object) {
    MetricsReporter.logInfo(this.decorateMessage(message));
  }

  public logWarning(message: string | object) {
    MetricsReporter.logWarning(this.decorateMessage(message));
  }

  public logError(errorMessage: string, error?: Error, details?: object) {
    const message = {
      errorMessage,
      error: error?.stack || error?.message,
      details,
    };
    MetricsReporter.logError(this.decorateMessage(message));
  }

  public reportLoadTime(
    metricName: string,
    loadTimeMs: number,
    dimensions: MetricDimension[] = []
  ) {
    MetricsReporter.publishMetric(metricName, loadTimeMs, 'Milliseconds', [
      ...dimensions,
      ...this.getCommonDimensions(),
    ]);
  }

  public incrementCounter(
    metricName: string,
    dimensions: MetricDimension[] = []
  ) {
    MetricsReporter.incrementCounter(metricName, [
      ...dimensions,
      ...this.getCommonDimensions(),
    ]);
  }

  public reportSevereError(dimensions: MetricDimension[] = []) {
    MetricsReporter.incrementCounter('SevereError', [
      ...dimensions,
      ...this.getCommonDimensions(),
    ]);
  }

  public reset() {
    this.commonProperties = {};
  }

  private decorateMessage(message: string | object): object {
    if (typeof message === 'string') {
      message = {
        message,
      };
    }

    return {
      ...message,
      ...this.commonProperties,
    };
  }

  /**
   * Get a list of common dimensions for every Lab metric event.
   */
  private getCommonDimensions(): MetricDimension[] {
    const dimensions = [];
    if (this.commonProperties.appName) {
      dimensions.push({
        name: 'AppName',
        value: this.commonProperties.appName,
      });
    }
    return dimensions;
  }
}
