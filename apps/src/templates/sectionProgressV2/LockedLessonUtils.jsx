export const getLockedStatusPerStudent = (
  levelProgressByStudent,
  sortedStudents,
  lesson
) => {
  if (!sortedStudents || sortedStudents.length === 0) {
    return {};
  }

  if (
    !lesson ||
    !lesson.lockable ||
    !lesson.levels ||
    !levelProgressByStudent
  ) {
    return Object.fromEntries(
      sortedStudents.map(student => [student.id, false])
    );
  }

  return Object.fromEntries(
    sortedStudents
      .map(student => {
        if (!student || student.id === undefined) {
          return null;
        }
        return [
          student.id,
          lesson.lockable &&
            lesson.levels.every(
              level =>
                levelProgressByStudent[student.id] &&
                levelProgressByStudent[student.id][level.id]?.locked
            ),
        ];
      })
      .filter(entry => entry !== null)
  );
};

export const areAllLevelsLocked = lockedStatusPerStudent => {
  return Object.values(lockedStatusPerStudent).every(status => status);
};
