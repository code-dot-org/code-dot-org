import {expect} from '../../../util/reconfiguredChai';
import stubFirehose from './util/stubFirehose';

const maxDataJSONBytes = 65500;
const maxDataStringBytes = 4095;

describe('firehoseDataSize', () => {
  it('checks json size for correct error', () => {
    const valid_record = {data_json: 'x' * (maxDataJSONBytes - 1)};
    stubFirehose.putRecord(valid_record);

    const invalid_record = {data_json: 'x' * (maxDataJSONBytes + 1)};
    expect(stubFirehose.putRecord(invalid_record)).to.throw(Error);
  });

  it('checks string size for correct error', () => {
    const valid_record = {data_string: 'x' * (maxDataStringBytes - 1)};
    stubFirehose.putRecord(valid_record);

    const invalid_record = {data_string: 'x' * (maxDataStringBytes + 1)};
    expect(stubFirehose.putRecord(invalid_record)).to.throw(Error);
  });
});
