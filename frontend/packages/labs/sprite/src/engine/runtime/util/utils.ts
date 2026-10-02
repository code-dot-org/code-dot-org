/**
 * The helpers the runtime takes from apps' `src/utils.js`.
 */

/** A version 4 UUID; apps' `createUuid` made the same shape by hand. */
export function createUuid(): string {
  return crypto.randomUUID();
}

/**
 * Splits `str` at `delimiter` into lines, each shorter than `maxLength`
 * unless a single word is longer.
 */
export function stringToChunks(
  str: string,
  maxLength: number,
  delimiter = ' ',
): string[] {
  return str.split(delimiter).reduce(
    (acc, val) => {
      let lastVal = '';
      if (acc[acc.length - 1].length + val.length < maxLength) {
        lastVal = acc.pop() + delimiter;
      }

      lastVal += val;
      acc.push(lastVal.trim());
      return acc;
    },
    [''],
  );
}

/** Cuts `inputText` to `maxLength` characters, ending in '...'. */
export function ellipsify(
  inputText: string | undefined | null,
  maxLength: number,
): string {
  if (inputText && inputText.length > maxLength) {
    return inputText.substr(0, maxLength - 3) + '...';
  }
  return inputText || '';
}
