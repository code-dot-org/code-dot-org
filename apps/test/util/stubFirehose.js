import {stub} from 'sinon';
import firehose from '@cdo/apps/lib/util/firehose';

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
