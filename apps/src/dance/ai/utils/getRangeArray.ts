// Returns an array containing [min, min+1, min+2, ..., max]
export const getRangeArray = (min: number, max: number) => {
  const len = max - min + 1;
  const arr = new Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = min + i;
  }
  return arr;
};
