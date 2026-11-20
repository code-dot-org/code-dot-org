export interface RowSplit {
  trained: number[];
  accuracyCheck: number[];
}

export function splitRowIndices(
  rowCount: number,
  accuracyCheckRowIndices: number[]
): RowSplit {
  const reserved = new Set(accuracyCheckRowIndices);
  const split: RowSplit = {trained: [], accuracyCheck: []};
  for (let row = 0; row < rowCount; row++) {
    (reserved.has(row) ? split.accuracyCheck : split.trained).push(row);
  }
  return split;
}

/*
  Whether a saved split still describes this dataset: every index names a row,
  and some rows are left over to train on. If the rowCount has changed,
  the split may no longer be valid.
*/
export function describesDataset(
  accuracyCheckRowIndices: number[],
  rowCount: number
): boolean {
  const reserved = new Set(accuracyCheckRowIndices);
  return (
    reserved.size > 0 &&
    reserved.size < rowCount &&
    [...reserved].every(
      index => Number.isInteger(index) && index >= 0 && index < rowCount
    )
  );
}
