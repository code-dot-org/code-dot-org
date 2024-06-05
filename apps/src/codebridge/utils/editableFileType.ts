const defaultEditableFileTypesArray = ['html', 'css'];
export const editableFileType = (
  language: string,
  editableFileTypesArray = defaultEditableFileTypesArray
) => {
  const editableFileTypes = new Set(editableFileTypesArray);
  return editableFileTypes.has(language);
};
