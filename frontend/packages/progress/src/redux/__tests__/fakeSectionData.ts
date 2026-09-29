// apps/test/unit/code-studio/fakeSectionData.js: /api/lock_status for two
// sections sharing one lockable lesson.

import type {LockStatusResponse} from '@code-dot-org/core/api';

export const section1Id = 42;
export const section2Id = 43;
export const lesson1Id = 12;
export const scriptId = 3000;

const student = (
  userId: number,
  name: string,
  locked: boolean,
  readonlyAnswers: boolean,
) => ({
  locked,
  name,
  user_level_data: {user_id: userId, level_id: 2000, script_id: scriptId},
  readonly_answers: readonlyAnswers,
});

const fakeSectionData = (): LockStatusResponse => ({
  [section1Id]: {
    section_id: section1Id,
    section_name: 'My Section',
    lessons: {
      [lesson1Id]: [
        student(1001, 'student1', true, false),
        student(1002, 'student2', false, false),
        student(1003, 'student3', false, true),
      ],
    },
  },
  [section2Id]: {
    section_id: section2Id,
    section_name: 'My Other Section',
    lessons: {[lesson1Id]: [student(1004, 'student4', true, false)]},
  },
});

export default fakeSectionData;
