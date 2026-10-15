export interface RowSplit {
  // Dataset row indices, in dataset order; the examples and labels follow it.
  trained: number[];
  test: number[];
}

// The rows a run trains on, and the rows it holds back to grade itself on.
export function splitRowIndices(
  rowCount: number,
  accuracyCheckRowIndices: number[],
): RowSplit {
  const reserved = new Set(accuracyCheckRowIndices);
  const split: RowSplit = {trained: [], test: []};
  for (let row = 0; row < rowCount; row++) {
    (reserved.has(row) ? split.test : split.trained).push(row);
  }
  return split;
}
