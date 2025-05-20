// Contentful is sending back arrays out of order,
// this sorts in ascending order before displaying it.
export const sortArrayInAscendingOrder = (a: string, b: string) => {
  const gradeA = parseInt(a, 10);
  const gradeB = parseInt(b, 10);
  const isGradeA = !isNaN(gradeA);
  const isGradeB = !isNaN(gradeB);

  // If one is a string (not a number), sort that first.
  // It will likely be a grade range like "K-2".
  if (!isGradeA && isGradeB) return -1;
  if (isGradeA && !isGradeB) return 1;

  // If both are numbers, sort numerically
  if (isGradeA && isGradeB) return gradeA - gradeB;

  return a < b ? -1 : a > b ? 1 : 0;
};
