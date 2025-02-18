const defaultPreviewFileTypesArray = ['html'];

/**
 * Determines if a given language is supported for previewing.
 *
 * @param language - The language to check.
 * @param previewFileTypesArray - An optional array of supported preview file types. If not provided, the default array `['html']` is used.
 * @returns `true` if the language is supported for previewing, `false` otherwise.
 */
export const previewFileType = (
  language: string,
  previewFileTypesArray = defaultPreviewFileTypesArray
) => {
  const previewFileTypes = new Set(previewFileTypesArray);
  return previewFileTypes.has(language);
};
