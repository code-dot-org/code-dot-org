// Common utils shared between legacy and Lab2 Dance

export function computeCharactersReferenced(studentCode: string): string[] {
  // Process studentCode to determine which characters are referenced and create
  // charactersReferencedSet with the results:
  const charactersReferencedSet = new Set<string>();
  const charactersRegExp = new RegExp(
    /^.*make(Anonymous|New)DanceSprite(?:Group)?\([^"]*"([^"]*)[^\r\n]*/,
    'gm'
  );
  let match;
  while ((match = charactersRegExp.exec(studentCode))) {
    const characterName = match[2];
    charactersReferencedSet.add(characterName);
  }
  return Array.from(charactersReferencedSet);
}
