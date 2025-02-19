// Returns the filename with a '_' and a number appended to the name and includes file extension.
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
