// restrict typed in input to what we consider to be valid names, which for now are just word characters or hyphens
export const validateFolderName = (name: string = '') =>
  Boolean(name.match(/^[\w-]+$/));
