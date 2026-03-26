import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import type {MetricsApi} from '@cdo/apps/metrics/MetricsApi';
import {MetricsReporter} from '@cdo/apps/metrics/MetricsReporter';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('MetricsReporter RumClient delegation', () => {
  let reporter: MetricsReporter;
  let mockRumClient: {
    recordLog: sinon.SinonStub;
    recordMetric: sinon.SinonStub;
  };
  let mockMetricsApi: MetricsApi;
  let localStorageGetItemStub: sinon.SinonStub;

  beforeEach(() => {
    mockMetricsApi = {
      sendLogs: sinon.stub().resolves(),
      sendMetricData: sinon.stub().resolves(),
    };
    mockRumClient = {
      recordLog: sinon.stub(),
      recordMetric: sinon.stub(),
    };
    localStorageGetItemStub = sinon.stub(localStorage, 'getItem').returns(null);
    sinon.stub(localStorage, 'setItem');
    reporter = new MetricsReporter(mockMetricsApi);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reporter.setRumClient(mockRumClient as any);
  });

  afterEach(() => {
    sinon.restore();
    localStorageGetItemStub;
  });

  describe('setRumClient', () => {
    it('accepts a RumClient without throwing', () => {
      const newReporter = new MetricsReporter(mockMetricsApi);

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newReporter.setRumClient(mockRumClient as any)
      ).not.to.throw();
    });
  });

  describe('logInfo', () => {
    it('delegates to rumClient.recordLog with level "info"', () => {
      reporter.logInfo('test message');
      sinon.assert.calledOnce(mockRumClient.recordLog);
      sinon.assert.calledWith(mockRumClient.recordLog, 'info', 'test message');
    });

    it('stringifies object messages for RumClient', () => {
      reporter.logInfo({key: 'value'});
      sinon.assert.calledOnce(mockRumClient.recordLog);
      expect(mockRumClient.recordLog.args[0][0]).to.equal('info');
      expect(mockRumClient.recordLog.args[0][1]).to.equal('{"key":"value"}');
    });
  });

  describe('logWarning', () => {
    it('delegates to rumClient.recordLog with level "warn"', () => {
      reporter.logWarning('warning message');
      sinon.assert.calledOnce(mockRumClient.recordLog);
      sinon.assert.calledWith(
        mockRumClient.recordLog,
        'warn',
        'warning message'
      );
    });
  });

  describe('logError', () => {
    it('delegates to rumClient.recordLog with level "error"', () => {
      reporter.logError('error message');
      sinon.assert.calledOnce(mockRumClient.recordLog);
      sinon.assert.calledWith(
        mockRumClient.recordLog,
        'error',
        'error message'
      );
    });
  });

  describe('publishMetric', () => {
    it('delegates to rumClient.recordMetric with name and value', () => {
      reporter.publishMetric('test.metric', 42, 'Count');
      sinon.assert.calledOnce(mockRumClient.recordMetric);
      expect(mockRumClient.recordMetric.args[0][0]).to.equal('test.metric');
      expect(mockRumClient.recordMetric.args[0][1]).to.equal(42);
    });

    it('does not throw when rumClient is not set', () => {
      const newReporter = new MetricsReporter(mockMetricsApi);
      expect(() => newReporter.publishMetric('m', 1, 'Count')).not.to.throw();
    });
  });
});
