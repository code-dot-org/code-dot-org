let filesVersionIdVal = undefined;

export const filesVersionId = () => filesVersionIdVal;
export const setFilesVersionId = newFilesVersionIdVal =>
  (filesVersionIdVal = newFilesVersionIdVal);
