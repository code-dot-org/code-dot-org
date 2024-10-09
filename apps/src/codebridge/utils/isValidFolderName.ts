/**
 * Checks if a given string is a valid folder name.
 *
 * A valid folder name consists of one or more word characters (letters, numbers, underscores) or hyphens.
 *
 * @param name - The string to check.
 * @returns `true` if the string is a valid folder name, `false` otherwise.
 */
export const isValidFolderName = (name: string = '') =>
  Boolean(name.match(/^[\w-]+$/));
