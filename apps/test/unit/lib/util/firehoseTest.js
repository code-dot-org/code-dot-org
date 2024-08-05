import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import {validateFirehoseDataSize} from '@cdo/apps/lib/util/firehose';
import logToCloud from '@cdo/apps/logToCloud';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    expect(validateFirehoseDataSize(valid_record)).not.to.be.true;
    expect(logToCloud.logError).not.to.be.called;

    const invalid_record = {data_json: 'x'.repeat(maxDataJSONBytes + 1)};
    expect(() => {
      validateFirehoseDataSize(invalid_record);
    }).not.to.throw();
    expect(logToCloud.logError).to.be.calledOnce;
    expect(validateFirehoseDataSize(invalid_record)).to.be.true;
  });

  it('checks string size to send newrelic error', () => {
    const valid_record = {data_string: 'x'.repeat(maxDataStringBytes - 1)};
    expect(validateFirehoseDataSize(valid_record)).not.to.be.true;
    expect(logToCloud.logError).not.to.be.called;

    const invalid_record = {data_string: 'x'.repeat(maxDataStringBytes + 1)};
    expect(() => {
      validateFirehoseDataSize(invalid_record);
    }).not.to.throw();
    expect(logToCloud.logError).to.be.calledOnce;
    expect(validateFirehoseDataSize(invalid_record)).to.be.true;
  });

  it('ensures validation does not fail empty and undefined cases', () => {
    const null_record = {};
    expect(validateFirehoseDataSize(null_record)).not.to.be.true;
    expect(logToCloud.logError).not.to.be.called;
    expect(validateFirehoseDataSize(undefined)).not.to.be.true;
    expect(logToCloud.logError).not.to.be.called;
  });
});
