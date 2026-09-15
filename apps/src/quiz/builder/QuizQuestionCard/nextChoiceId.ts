// Picks the next unused lowercase letter, matching the a/b/c scheme the
// create-question stub already seeds (see NEW_QUESTION_DEFAULTS in
// ../useQuizBuilderQuestions). Falls back to a numbered id past 'z', which
// no real quiz has enough choices to reach.
export default function nextChoiceId(existingIds: string[]): string {
  const used = new Set(existingIds);
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode('a'.charCodeAt(0) + i);
    if (!used.has(letter)) {
      return letter;
    }
  }
  let n = existingIds.length;
  while (used.has(`choice-${n}`)) {
    n++;
  }
  return `choice-${n}`;
}
