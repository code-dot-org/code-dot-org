const defaultEditableFileTypesArray = ['html', 'css'];

/**
 * Determines if a given language is editable.
 *
 * @param language - The language to check.
 * @param editableFileTypesArray - An optional array of editable file types. If not provided, the default array `['html', 'css']` is used.
 * @returns `true` if the language is editable, `false` otherwise.
 */
export const editableFileType = (
  language: string,
  editableFileTypesArray = defaultEditableFileTypesArray
) => {
  const editableFileTypes = new Set(editableFileTypesArray);
  return editableFileTypes.has(language);
};
