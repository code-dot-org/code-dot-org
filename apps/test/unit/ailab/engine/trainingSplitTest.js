import {
  describesDataset,
  splitRowIndices,
} from '@cdo/apps/ailab/engine/helpers/trainingSplit';

describe('splitRowIndices', () => {
  test('holds back the reserved rows, keeping both sets in dataset order', () => {
    expect(splitRowIndices(6, [4, 1])).toEqual({
      trained: [0, 2, 3, 5],
      accuracyCheck: [1, 4],
    });
  });

  test('ignores reserved indices past the last row', () => {
    expect(splitRowIndices(3, [2, 7])).toEqual({
      trained: [0, 1],
      accuracyCheck: [2],
    });
  });
});

describe('describesDataset', () => {
  test('accepts a split that leaves rows to train on', () => {
    expect(describesDataset([0, 2], 3)).toBe(true);
  });

  test('rejects an index past the last row', () => {
    expect(describesDataset([0, 3], 3)).toBe(false);
  });

  test('rejects a split with nothing left to train on', () => {
    expect(describesDataset([0, 1, 2], 3)).toBe(false);
  });

  test('rejects an empty split', () => {
    expect(describesDataset([], 3)).toBe(false);
  });
});
