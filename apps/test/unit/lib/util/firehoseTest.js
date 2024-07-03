import {stub} from 'sinon';

import {validateFirehoseDataSize} from '@cdo/apps/lib/util/firehose';
import logToCloud from '@cdo/apps/logToCloud';



jest.unmock('@cdo/apps/lib/util/firehose');

describe('firehoseDataSize', () => {
  const maxDataJSONBytes = 65500;
  const maxDataStringBytes = 4095;

  beforeEach(() => {
    stub(logToCloud, 'logError');
  });

  afterEach(() => {
    logToCloud.logError.restore();
  });

  it('checks json size to send newrelic error', () => {
    const valid_record = {data_json: 'x'.repeat(maxDataJSONBytes - 1)};
    expect(validateFirehoseDataSize(valid_record)).not.toBe(true);
    expect(logToCloud.logError).not.toHaveBeenCalled();

    const invalid_record = {data_json: 'x'.repeat(maxDataJSONBytes + 1)};
    expect(() => {
      validateFirehoseDataSize(invalid_record);
    }).not.toThrow();
    expect(logToCloud.logError).toHaveBeenCalledTimes(1);
    expect(validateFirehoseDataSize(invalid_record)).toBe(true);
  });

  it('checks string size to send newrelic error', () => {
    const valid_record = {data_string: 'x'.repeat(maxDataStringBytes - 1)};
    expect(validateFirehoseDataSize(valid_record)).not.toBe(true);
    expect(logToCloud.logError).not.toHaveBeenCalled();

    const invalid_record = {data_string: 'x'.repeat(maxDataStringBytes + 1)};
    expect(() => {
      validateFirehoseDataSize(invalid_record);
    }).not.toThrow();
    expect(logToCloud.logError).toHaveBeenCalledTimes(1);
    expect(validateFirehoseDataSize(invalid_record)).toBe(true);
  });

  it('ensures validation does not fail empty and undefined cases', () => {
    const null_record = {};
    expect(validateFirehoseDataSize(null_record)).not.toBe(true);
    expect(logToCloud.logError).not.toHaveBeenCalled();
    expect(validateFirehoseDataSize(undefined)).not.toBe(true);
    expect(logToCloud.logError).not.toHaveBeenCalled();
  });
});
