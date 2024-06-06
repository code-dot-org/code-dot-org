const collator = new Intl.Collator();

/** Returns a comparator function that sorts objects a and b by the given
 * string keys, in order of priority.
 * Example: comparator(['familyName', 'name']) will sort by familyName
 * first, looking at name if necessary to break ties.
 * Note: sorts on all alphanumerical symbols, not just letters.
 */
export default function stringKeyComparator(keys) {
  return (a, b) => {
    return keys.reduce((result, key) => {
      // Return early if we already have a result from a previous field.
      if (result !== 0) {
        return result;
      }

      const aField = a[key] || '';
      const bField = b[key] || '';

      // Sort strings with characters before strings without
      if (!!aField && !bField) {
        return -1;
      }
      if (!aField && !!bField) {
        return 1;
      }

      // Compare strings directly
      return collator.compare(aField, bField);
    }, 0);
  };
}
