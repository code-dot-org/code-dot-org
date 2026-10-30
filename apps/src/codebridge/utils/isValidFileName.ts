/**
 * Checks if a given string is a valid file name.
 *
 * A valid file name consists of one or more word characters (letters, numbers, underscores) or hyphens.
 * When a dropdown is present, the file extension is provided separately, so periods are not allowed.
 * When no dropdown is present, the file extension is optional.
 *
 * @param name - The string to check.
 * @param hasDropdown - Whether a dropdown is present for selecting the file extension.
 * @returns `true` if the string is a valid file name, `false` otherwise.
 */
export const isValidFileName = (
  name: string = '',
  hasDropdown: boolean = false
) =>
  hasDropdown
    ? Boolean(name.match(/^[\w-]+$/))
    : Boolean(name.match(/^[\w-]+(\.\w+)?$/));
