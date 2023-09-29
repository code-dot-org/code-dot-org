const collator = new Intl.Collator();

/** Returns a comparator function that sorts objects a and b by the given
 * string keys, in order of priority.
 * Example: comparator(['familyName', 'name']) will sort by familyName
 * first, looking at name if necessary to break ties.
 * Note: sorts on all alphanumerical symbols, not just letters.
 */
export default function stringKeyComparator(keys) {
  return (a, b) => {
    // Sort strings with characters before strings without
    if (!!a && !b) {
      return -1;
    }
    if (!a && !!b) {
      return 1;
    }

    return keys.reduce(
      (result, key) => result || collator.compare(a[key] || '', b[key] || ''),
      0
    );
  };
}
