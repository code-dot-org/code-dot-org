export const integers = (length: number, start: number = 0) =>
  Array.from({length}, (_, i) => i + start);
