const defaultPreviewFileTypesArray = ['html'];
export const previewFileType = (
  language: string,
  previewFileTypesArray = defaultPreviewFileTypesArray
) => {
  const previewFileTypes = new Set(previewFileTypesArray);
  return previewFileTypes.has(language);
};
