export const coursesKeys = {
  all: ['courses'] as const,

  structure: (course: string, unitPosition: number) =>
    [...coursesKeys.all, 'structure', course, unitPosition] as const,
};
