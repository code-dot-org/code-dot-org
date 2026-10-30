import * as Observability from '@code-dot-org/core/plugins/observability';

import DCDO from '@cdo/apps/dcdo';
import DashboardMetricsApi from '@cdo/apps/metrics/DashboardMetricsApi';
import {MetricsApi} from '@cdo/apps/metrics/MetricsApi';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  logger: {info: jest.fn(), warn: jest.fn(), error: jest.fn()},
  metrics: {count: jest.fn()},
}));

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));

/**
 * isDevelopmentEnvironment uses window.location.hostname ('localhost' in jsdom),
 * which causes shouldReport() to return false and skip all gate logic. Mock to
 * false so tests reach the browser-events-enabled gate code paths.
 */
jest.mock('@cdo/apps/utils', () => ({
  isDevelopmentEnvironment: jest.fn().mockReturnValue(false),
}));

jest.mock('@cdo/apps/util/browser-detector', () => ({
  getBrowserName: jest.fn().mockReturnValue('Chrome'),
}));

jest.mock('@cdo/apps/metrics/DashboardMetricsApi', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    sendLogs: jest.fn().mockResolvedValue(null),
    sendMetricData: jest.fn().mockResolvedValue(null),
  }),
}));

/** The mock api instance wired into the MetricsReporter singleton at module init. */
const mockApi = (DashboardMetricsApi as jest.Mock).mock.results[0]
  .value as jest.Mocked<MetricsApi>;

describe('MetricsReporter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('browser-events-enabled gate', () => {
    it('calls sendLogs when gate is true (log path)', () => {
      (DCDO.get as jest.Mock).mockReturnValue(true);
      MetricsReporter.logInfo('hello');
      expect(mockApi.sendLogs).toHaveBeenCalledTimes(1);
    });

    it('suppresses sendLogs and does not mutate localStorage when gate is false (log path)', () => {
      (DCDO.get as jest.Mock).mockReturnValue(false);
      MetricsReporter.logInfo('hello');
      expect(mockApi.sendLogs).not.toHaveBeenCalled();
      expect(
        localStorage.getItem('cdo-metrics-reporter-last-check-time')
      ).toBeNull();
    });

    it('calls sendMetricData when gate is true (metric path)', () => {
      (DCDO.get as jest.Mock).mockReturnValue(true);
      MetricsReporter.publishMetric('M', 1, 'Count');
      expect(mockApi.sendMetricData).toHaveBeenCalledTimes(1);
    });

    it('suppresses sendMetricData when gate is false (metric path)', () => {
      (DCDO.get as jest.Mock).mockReturnValue(false);
      MetricsReporter.publishMetric('M', 1, 'Count');
      expect(mockApi.sendMetricData).not.toHaveBeenCalled();
    });

    it('sends to the observability logger and suppresses sendLogs when Sentry is on and gate is off', () => {
      (DCDO.get as jest.Mock).mockImplementation(
        (key: string, defaultValue: unknown) => {
          if (key === 'frontend-observability-enabled') return true;
          if (key === 'browser-events-enabled') return false;
          return defaultValue;
        }
      );
      MetricsReporter.logError('boom');
      expect(Observability.logger.error).toHaveBeenCalledWith(
        'boom',
        expect.any(Object)
      );
      expect(mockApi.sendLogs).not.toHaveBeenCalled();
    });

    it('invokes sendLogs when browser-events-enabled is unset (defaults to true)', () => {
      (DCDO.get as jest.Mock).mockImplementation(
        (_key: string, defaultValue: unknown) => defaultValue
      );
      MetricsReporter.logInfo('hello');
      expect(mockApi.sendLogs).toHaveBeenCalledTimes(1);
    });
  });
});
