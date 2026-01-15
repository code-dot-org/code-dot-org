/**
 * Checks if a given string is a valid file name.
 *
 * A valid file name consists of one or more word characters (letters, numbers, underscores) or hyphens.
 * The file extension is optional as it may be provided separately via a dropdown selection.
 *
 * @param name - The string to check.
 * @returns `true` if the string is a valid file name, `false` otherwise.
 */
export const isValidFileName = (name: string = '') =>
  Boolean(name.match(/^[\w-]+(\.\w+)?$/));
