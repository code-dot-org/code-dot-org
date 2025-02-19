/**
 * Returns a new filename by appending or incrementing a number suffix and
 * includes file extension.
 * If the original filename ends with a number (e.g., "file_1.py"), the function
 * increments the number (e.g., "file_2.py").
 * If there is no number suffix is present, it appends "_1" before the file extension.
 * (e.g., "file.py" -> "file_1.py").
 * @param filename - the original filename which includes the file extension
 * @returns new file name with number suffix
 */
export const getFileNameWithNumberSuffix = (filename: string) => {
  const parts = filename.split('.');
  const originalName = parts[0];
  const fileExtension = parts[1];
  const nameParts = originalName.split('_');
  const lastPart = nameParts[nameParts.length - 1];
  const numberSuffix = parseInt(lastPart, 10); // NaN if not a number.
  let newNumber = 1;
  if (Number.isInteger(numberSuffix)) {
    newNumber = numberSuffix + 1;
    nameParts.pop(); // Remove the existing number suffix before adding new number suffix.
  }
  return `${nameParts.join('_')}_${newNumber}.${fileExtension}`;
};
