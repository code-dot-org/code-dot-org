import {test as base, type Page} from '@playwright/test';

import {createLevelbuilder, createStudent, createTeacher} from './auth';

/**
 * Option controlling the age of the student account created by studentPage.
 * Set per-describe with test.use({ studentAge: 10 }) for under-13 behaviour.
 */
interface StudentOptions {
  studentAge: number;
}

interface AuthFixtures {
  /** Authenticated student page. Age set by the studentAge option (default 16). */
  studentPage: Page;
  /** Authenticated teacher page. */
  teacherPage: Page;
  /** Authenticated levelbuilder page (teacher + levelbuilder access). */
  levelbuilderPage: Page;
}

export const test = base.extend<StudentOptions & AuthFixtures>({
  studentAge: [16, {option: true}],

  studentPage: async ({page, studentAge}, use) => {
    await createStudent(page, {age: studentAge});
    await use(page);
  },

  teacherPage: async ({page}, use) => {
    await createTeacher(page);
    await use(page);
  },

  levelbuilderPage: async ({page}, use) => {
    await createLevelbuilder(page);
    await use(page);
  },
});

export {expect} from '@playwright/test';
