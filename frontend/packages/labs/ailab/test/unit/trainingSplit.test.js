import {splitRowIndices} from '../../src/helpers/trainingSplit';

describe('splitRowIndices', () => {
  test('holds back the reserved rows, keeping both sets in dataset order', () => {
    expect(splitRowIndices(6, [4, 1])).toEqual({
      trained: [0, 2, 3, 5],
      test: [1, 4],
    });
  });

  test('ignores reserved indices past the last row', () => {
    expect(splitRowIndices(3, [2, 7])).toEqual({trained: [0, 1], test: [2]});
  });
});
