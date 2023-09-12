const collator = new Intl.Collator();

/**
 * This comparator function is used to sort strings without respect to any
 * non-alphabetic characters, putting strings composed solely of non-alphabetic
 * characters at the end of the list. Ties are broken by using non-alphabetic
 * characters.
 **/
export default function letterCompare(a, b) {
  // Strip out any non-alphabetic characters from the strings before sorting
  // (https://unicode.org/reports/tr44/#Alphabetic)
  const aLetters = a.replace(/[^\p{Alphabetic}]/gu, '');
  const bLetters = b.replace(/[^\p{Alphabetic}]/gu, '');

  const initialCompare = collator.compare(aLetters, bLetters);

  // Sort strings with letters before strings without
  if (initialCompare > 0 && !!aLetters && !bLetters) {
    return -1;
  }
  if (initialCompare < 0 && !aLetters && !!bLetters) {
    return 1;
  }

  // Use original strings as a fallback if the special-character-stripped
  // version compares as equal.
  return initialCompare || collator.compare(a, b);
}
