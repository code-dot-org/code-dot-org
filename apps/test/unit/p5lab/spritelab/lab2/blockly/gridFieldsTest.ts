import {singleCellValidator} from '@cdo/apps/p5lab/spritelab/lab2/blockly/gridFields';

const grid = (...marks: [number, number][]): number[][] => {
  const g = Array.from({length: 8}, () => Array(8).fill(0));
  marks.forEach(([r, c]) => (g[r][c] = 1));
  return g;
};

// The editor's intermediate value can hold the previous mark and the newly
// clicked cell together; the added one must win regardless of scan order.
const withPrev = (prev: number[][] | null) =>
  singleCellValidator.bind({getValue: () => prev} as never);

describe('singleCellValidator', () => {
  it('keeps a single mark', () => {
    expect(withPrev(null)(grid([3, 3]))).toEqual(grid([3, 3]));
  });

  it('keeps the added mark when the new cell is below the old one', () => {
    expect(withPrev(grid([2, 3]))(grid([2, 3], [5, 3]))).toEqual(grid([5, 3]));
  });

  it('keeps the added mark when the new cell is above the old one', () => {
    expect(withPrev(grid([5, 3]))(grid([5, 3], [2, 3]))).toEqual(grid([2, 3]));
  });

  it('keeps the added mark to the right on the same row', () => {
    expect(withPrev(grid([4, 2]))(grid([4, 2], [4, 6]))).toEqual(grid([4, 6]));
  });

  it('clears when the only mark is removed', () => {
    expect(withPrev(grid([4, 2]))(grid())).toEqual(grid());
  });

  it('falls back to the first mark without previous context', () => {
    expect(withPrev(null)(grid([2, 3], [5, 3]))).toEqual(grid([2, 3]));
  });
});
