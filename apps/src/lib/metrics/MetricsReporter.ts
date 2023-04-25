import {MetricsApi} from './MetricsApi';

const isDevelopmentEnvironment =
  require('../../utils').isDevelopmentEnvironment;

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

type LogLevel = 'INFO' | 'WARNING' | 'SEVERE';

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
// TODO: This class will be used once more functionality is implemented.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MetricsReporter {
  private lastCheckCanReportTime: number;

  constructor(private readonly metricsApi: MetricsApi) {
    this.metricsApi = metricsApi;
    this.lastCheckCanReportTime =
      parseInt(localStorage.getItem(LOCAL_STORAGE_KEY_NAME) || '0') || 0;
  }

  logInfo(message: string | object) {
    this.log('INFO', message);
    if (isDevelopmentEnvironment()) {
      console.log('[MetricsReporter] ' + JSON.stringify(message));
    }
  }

  logWarning(message: string | object) {
    this.log('WARNING', message);
    if (isDevelopmentEnvironment()) {
      console.warn('[MetricsReporter] ' + JSON.stringify(message));
    }
  }

  logError(message: string | object) {
    this.log('SEVERE', message);
    if (isDevelopmentEnvironment()) {
      console.error('[MetricsReporter] ' + JSON.stringify(message));
    }
  }

  private log(level: LogLevel, message: string | object) {
    const payload = {
      level,
      message,
      deviceInfo: this.getDeviceInfo(),
    };

    if (!this.isReportingEnabled()) {
      this.fallbackLog(payload);
      return;
    }

    this.metricsApi.sendLogs([payload]).then(response => {
      if (!response.ok) {
        this.fallbackLog(payload);
      }

      if (response.status === 401) {
        // Unauthorized response from server; client logging is likely disabled.
        // We will check again after a time period of CHECK_CAN_REPORT_INTERVAL
        this.setReportingDisabled();
      }
    });
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
}
