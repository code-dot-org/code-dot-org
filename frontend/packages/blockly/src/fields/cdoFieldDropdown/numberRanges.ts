/**
 * The numbers a printer-style range names, e.g. "1,2,4-6" as [1,2,4,5,6].
 * Items that are neither a number nor a range are skipped.
 */
export function printerStyleNumberRangeToList(rangeString: string): number[] {
  const rangeRegExp = /^(\d+)-(\d+)$/;
  const numberRegExp = /^(\d+)$/;
  return rangeString
    .replace(/ /g, '')
    .split(',')
    .reduce<number[]>((numbers, item) => {
      const range = rangeRegExp.exec(item);
      const number = numberRegExp.exec(item);
      if (range) {
        const low = Number(range[1]);
        const high = Number(range[2]);
        for (let n = low; n <= high; n++) {
          numbers.push(n);
        }
      } else if (number) {
        numbers.push(Number(number[1]));
      }
      return numbers;
    }, []);
}

/** The numbers joined by commas, e.g. [1,2,4] as "1,2,4". */
export function numberListToString(numberList: number[]): string {
  return numberList.join(',');
}
