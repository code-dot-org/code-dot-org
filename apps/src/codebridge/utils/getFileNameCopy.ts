// Returns the filename with '_copy' appended to it and includes file extension.
export const getFileNameCopy = (filename: string) => {
  const parts = filename.split('.');
  const originalName = parts[0];
  const fileExtension = parts[1];
  return `${originalName}_copy.${fileExtension}`;
};
