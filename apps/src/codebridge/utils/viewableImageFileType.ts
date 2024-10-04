const defaultViewableImageFileTypesArray = ['png', 'jpg', 'gif'];
export const viewableImageFileType = (
  extension: string,
  viewableImageFileTypesArray = defaultViewableImageFileTypesArray
) => {
  const viewableImageFileTypes = new Set(viewableImageFileTypesArray);
  return viewableImageFileTypes.has(extension);
};
