import MetricsReporter from '../lib/metrics/MetricsReporter';
import {MetricDimension} from '../lib/metrics/types';

interface ReportingProperties {
  channelId?: string;
  projectType?: string;
  currentLevelId?: string;
  scriptId?: number;
}

/**
 * Singleton metrics reporter for Lab2 labs.
 */
class Lab2MetricsReporter {
  private commonProperties: ReportingProperties = {};

  public updateProperties(properties: ReportingProperties) {
    this.commonProperties = {...this.commonProperties, ...properties};
  }

  public logInfo(message: string | object) {
    MetricsReporter.logInfo(this.decorateMessage(message));
  }

  public logWarning(message: string | object) {
    MetricsReporter.logWarning(this.decorateMessage(message));
  }

  public logError(errorMessage: string | object, error?: Error) {
    MetricsReporter.logError(this.decorateMessage({errorMessage, error}));
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

  private getCommonDimensions(): MetricDimension[] {
    const dimensions = [];
    if (this.commonProperties.projectType) {
      dimensions.push({
        name: 'ProjectType',
        value: this.commonProperties.projectType,
      });
    }
    return dimensions;
  }
}

export default new Lab2MetricsReporter();
