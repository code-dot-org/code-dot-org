import {MetricsReporter} from '@code-dot-org/core/metrics';
import type {MetricDimension, MetricUnit} from '@code-dot-org/core/metrics';

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
class LabMetricsReporter extends MetricsReporter {
  // Common fields that are added to every log payload.
  private commonProperties: ReportingProperties = {};

  constructor(initialProperties?: ReportingProperties) {
    super();
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
    super.logInfo(this.decorateMessage(message));
  }

  public logWarning(message: string | object) {
    super.logWarning(this.decorateMessage(message));
  }

  public logError(errorMessage: string, error?: Error, details?: object) {
    const message = {
      errorMessage,
      error: error?.stack || error?.message,
      details,
    };
    super.logError(this.decorateMessage(message));
  }

  public reportLoadTime(
    metricName: string,
    loadTimeMs: number,
    dimensions: MetricDimension[] = [],
  ) {
    super.publishMetric(metricName, loadTimeMs, 'Milliseconds', [
      ...dimensions,
      ...this.getCommonDimensions(),
    ]);
  }

  public publishMetric(
    name: string,
    value: number,
    unit: MetricUnit,
    dimensions: MetricDimension[] = [],
  ) {
    super.publishMetric(name, value, unit, [
      ...dimensions,
      ...this.getCommonDimensions(),
    ]);
  }

  public incrementCounter(
    metricName: string,
    dimensions: MetricDimension[] = [],
  ) {
    super.incrementCounter(metricName, [
      ...dimensions,
      ...this.getCommonDimensions(),
    ]);
  }

  public reportSevereError(dimensions: MetricDimension[] = []) {
    super.incrementCounter('SevereError', [
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

export default LabMetricsReporter;
