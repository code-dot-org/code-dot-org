import {test as base, type Page} from '@playwright/test';

import {
  createAuthorizedTeacher,
  createLevelbuilder,
  createStudent,
  createTeacher,
} from './auth';
import {createEyesHandle, type EyesFixture} from './eyes';

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
  /** Authenticated teacher page with authorized-teacher permission. */
  authorizedTeacherPage: Page;
}

interface EyesFixtures {
  /**
   * Applitools Eyes per-test handle. No-op when `APPLITOOLS_API_KEY` is
   * unset (so functional flow still runs in local dev). Opens the session
   * lazily on first `check`/`checkRegion`/`checkViewport` call; closes
   * fail-fast in fixture teardown (any visual diff throws).
   */
  eyes: EyesFixture;
}

export const test = base.extend<StudentOptions & AuthFixtures & EyesFixtures>({
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

  authorizedTeacherPage: async ({page}, use) => {
    await createAuthorizedTeacher(page);
    await use(page);
  },

  eyes: async ({page}, use, testInfo) => {
    const handle = createEyesHandle(page, testInfo.title);
    try {
      await use(handle);
    } finally {
      await handle.close();
    }
  },
});

export {expect} from '@playwright/test';
