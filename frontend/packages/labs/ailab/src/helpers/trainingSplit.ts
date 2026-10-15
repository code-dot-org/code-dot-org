export interface RowSplit {
  trained: number[];
  accuracyCheck: number[];
}

export function splitRowIndices(
  rowCount: number,
  accuracyCheckRowIndices: number[],
): RowSplit {
  const reserved = new Set(accuracyCheckRowIndices);
  const split: RowSplit = {trained: [], accuracyCheck: []};
  for (let row = 0; row < rowCount; row++) {
    (reserved.has(row) ? split.accuracyCheck : split.trained).push(row);
  }
  return split;
}
