import {getBrowserName} from '@cdo/apps/util/browser-detector';
import {isDevelopmentEnvironment} from '@cdo/apps/utils';
import DashboardMetricsApi from './DashboardMetricsApi';
import {MetricsApi} from './MetricsApi';
import {LogLevel, MetricDatum, MetricDimension, MetricUnit} from './types';

/**
 * If we receive an unauthorized response from the server, this may
 * indicate that browser event reporting has been temporarily disabled.
 * We will wait for a specific time interval (defined below) before making
 * a request again, so as to not flood the server with requests.
 */
const CHECK_CAN_REPORT_INTERVAL_MINUTES = 30;
const CHECK_CAN_REPORT_INTERVAL_MS =
  CHECK_CAN_REPORT_INTERVAL_MINUTES * 60 * 1000;
const LOCAL_STORAGE_KEY_NAME = 'cdo-metrics-reporter-last-check-time';
// A flag that can be toggled to send events regardless of environment
const ALWAYS_SEND = false;

/**
 * Reports logs and metrics, intended primarily for developer-facing
 * error reporting, metric reporting, and logging.
 *
 * For tracking user interactions and behaviors (product-facing),
 * see {@link AnalyticsReporter} which reports to Amplitude.
 *
 * For legacy client-side reporting see {@link firehose} for AWS
 * Firehose reporting and {@link logToCloud} for New Relic reporting.
 */
class MetricsReporter {
  private lastCheckCanReportTime: number;

  constructor(private readonly metricsApi: MetricsApi) {
    this.metricsApi = metricsApi;
    this.lastCheckCanReportTime =
      parseInt(localStorage.getItem(LOCAL_STORAGE_KEY_NAME) || '0') || 0;
  }

  /**
   * Publish an information log message. Can be a string or a structured object
   */
  logInfo(message: string | object) {
    if (!this.shouldReport()) {
      console.log(message);
      return;
    }
    this.log('INFO', message);
  }

  /**
   * Publish a warning log message. Can be a string or a structured object
   */
  logWarning(message: string | object) {
    if (!this.shouldReport()) {
      console.warn(message);
      return;
    }
    this.log('WARNING', message);
  }

  /**
   * Publish an error log message. Can be a string or a structured object
   */
  logError(message: string | object) {
    if (!this.shouldReport()) {
      console.error(message);
      return;
    }
    this.log('SEVERE', message);
  }

  /**
   * Increment a counter metric.
   */
  incrementCounter(name: string, dimensions: MetricDimension[] = []) {
    this.publishMetric(name, 1, 'Count', dimensions);
  }

  /**
   * Publish a metric.
   */
  publishMetric(
    name: string,
    value: number,
    unit: MetricUnit,
    dimensions: MetricDimension[] = []
  ) {
    const metric = {
      name,
      value,
      unit,
      dimensions: dimensions.concat(this.getDeviceDimensions()),
    };
    if (!this.shouldReport()) {
      console.info('[MetricsReporter] ' + JSON.stringify(metric));
      return;
    }
    this.sendMetric(metric);
  }

  private async log(level: LogLevel, message: string | object) {
    const payload = {
      level,
      message,
      deviceInfo: this.getDeviceInfo(),
    };

    if (!this.isReportingEnabled()) {
      this.fallbackLog(payload);
      return;
    }

    try {
      await this.metricsApi.sendLogs([payload]);
    } catch (error) {
      this.fallbackLog(payload);
      this.handleError(error as Error);
    }
  }

  private async sendMetric(metric: MetricDatum) {
    if (!this.isReportingEnabled()) {
      this.fallbackLog(metric);
      return;
    }

    try {
      await this.metricsApi.sendMetricData([metric]);
    } catch (error) {
      this.fallbackLog(metric);
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error) {
    if (error.message.includes('401')) {
      // Unauthorized response from server; client logging is likely disabled.
      // We will check again after a time period of CHECK_CAN_REPORT_INTERVAL
      this.setReportingDisabled();
    } else {
      console.error(error);
    }
  }

  private getDeviceInfo(): object {
    return {
      user_agent: window.navigator.userAgent,
      window_width: window.innerWidth,
      window_height: window.innerHeight,
      hostname: window.location.hostname,
      full_path: window.location.href,
    };
  }

  private getDeviceDimensions(): MetricDimension[] {
    return [
      {
        name: 'Hostname',
        value: window.location.hostname,
      },
      {
        name: 'Browser',
        value: getBrowserName(),
      },
      {
        name: 'BrowserVersion',
        value: getBrowserName(true),
      },
    ];
  }

  private fallbackLog(payload: object) {
    if (isDevelopmentEnvironment()) {
      console.log(
        'Client-side reporting disabled. Attempted to report: ' +
          JSON.stringify(payload)
      );
    }
  }

  private isReportingEnabled(): boolean {
    return (
      Date.now() - this.lastCheckCanReportTime > CHECK_CAN_REPORT_INTERVAL_MS
    );
  }

  private setReportingDisabled() {
    this.lastCheckCanReportTime = Date.now();
    localStorage.setItem(
      LOCAL_STORAGE_KEY_NAME,
      this.lastCheckCanReportTime.toString()
    );
  }

  /**
   * Whether we should try to report metrics to the server.
   * Always true if not on development. If on development,
   * this is controlled by the ALWAYS_SEND flag.
   */
  private shouldReport(): boolean {
    return ALWAYS_SEND || !isDevelopmentEnvironment();
  }
}

export default new MetricsReporter(new DashboardMetricsApi());
