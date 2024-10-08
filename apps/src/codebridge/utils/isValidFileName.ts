// restrict typed in input to what we consider to be valid names, which for now are word characters or hyphens + a dot + more word characters
export const isValidFileName = (name: string = '') =>
  Boolean(name.match(/^[\w-]+\.\w+$/));
