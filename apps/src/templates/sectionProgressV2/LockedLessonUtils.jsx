export const getLockedStatusPerStudent = (
  levelProgressByStudent,
  sortedStudents,
  lesson
) =>
  Object.fromEntries(
    sortedStudents.map(student => [
      student.id,
      lesson.lockable &&
        lesson.levels.every(
          level => levelProgressByStudent[student.id][level.id]?.locked
        ),
    ])
  );

export const areAllLevelsLocked = lockedStatusPerStudent => {
  return Object.values(lockedStatusPerStudent).every(status => status);
};
