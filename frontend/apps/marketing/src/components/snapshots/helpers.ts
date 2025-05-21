// Contentful is sending back arrays out of order,
// this sorts in ascending order before displaying.
export const sortInAscendingOrder = (a: string, b: string) => {
  const itemA = parseInt(a, 10);
  const itemB = parseInt(b, 10);
  const isItemANumeric = !isNaN(itemA);
  const isItemBNumeric = !isNaN(itemB);

  // If one is a string (not a number), sort that first.
  // This accounts for the "K" in the grades array.
  if (!isItemANumeric && isItemBNumeric) return -1;
  if (isItemANumeric && !isItemBNumeric) return 1;

  // If both are numbers, sort numerically
  if (isItemANumeric && isItemBNumeric) return itemA - itemB;

  return a < b ? -1 : a > b ? 1 : 0;
};
