import type {AilabSnapshot} from '@code-dot-org/ailab';

import {
  DEFAULT_SOURCES,
  snapshotToSources,
  sourcesToSnapshot,
} from '@cdo/apps/ailab/lab2/snapshotSources';

const SNAPSHOT = {
  version: 1,
  datasetId: 'zoo',
  labelColumn: 'animal',
  selectedFeatures: ['legs'],
} as unknown as AilabSnapshot;

describe('snapshotSources', () => {
  it('round-trips a snapshot', () => {
    expect(sourcesToSnapshot(snapshotToSources(SNAPSHOT))).toEqual(SNAPSHOT);
  });

  it('reads no snapshot from the default sources', () => {
    expect(sourcesToSnapshot(DEFAULT_SOURCES)).toBeUndefined();
  });

  it('reads no snapshot from malformed sources', () => {
    expect(sourcesToSnapshot({source: '{not json'})).toBeUndefined();
  });
});
