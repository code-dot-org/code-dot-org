export const coursesKeys = {
  all: ['courses'] as const,

  structure: (course: string, unitPosition: number) =>
    [...coursesKeys.all, 'structure', course, unitPosition] as const,

  levelProperties: (
    course: string,
    unitPosition: number,
    lessonPosition: number,
  ) =>
    [
      ...coursesKeys.all,
      'levelProperties',
      course,
      unitPosition,
      lessonPosition,
    ] as const,
};
