// Contentful is sending back arrays out of order,
// this sorts in ascending order before displaying.
export const sortInAscendingOrder = (a: string, b: string) => {
  const itemA = parseInt(a, 10);
  const itemB = parseInt(b, 10);
  const isItemA = !isNaN(itemA);
  const isItemB = !isNaN(itemB);

  // If one is a string (not a number), sort that first.
  // It will likely be a grade range like "K-2".
  if (!isItemA && isItemB) return -1;
  if (isItemA && !isItemB) return 1;

  // If both are numbers, sort numerically
  if (isItemA && isItemB) return itemA - itemB;

  return a < b ? -1 : a > b ? 1 : 0;
};
