import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import firehose from '@cdo/apps/metrics/firehose';

/**
 * Stub firehose logging functions within this block of tests,
 * squelching related log output.
 */
export default function stubFirehose() {
  before(() => {
    stub(firehose, 'putRecord');
    stub(firehose, 'putRecordBatch');
  });

  after(() => {
    firehose.putRecord.restore();
    firehose.putRecordBatch.restore();
  });
}
