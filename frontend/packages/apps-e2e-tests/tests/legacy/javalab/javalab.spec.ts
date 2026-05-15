import {type APIResponse, type Page} from '@playwright/test';
import path from 'path';

import {
  createAuthorizedTeacher,
  createSectionWithCourse,
  createStudent,
  createTeacher,
  createTeacherAssociatedStudent,
  joinSection,
  signIn as dashboardSignIn,
  type UserCredentials,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {JavaLabPage} from './JavaLabPage';

/**
 * Java Lab — commit code, code review, console-only, finish button, and
 * submittable level scenarios.
 *
 * Sources:
 *   dashboard/test/ui/features/javalab/commit_code.feature
 *   dashboard/test/ui/features/javalab/code_review_finish_button.feature
 *   dashboard/test/ui/features/javalab/code_review_scenarios.feature
 *   dashboard/test/ui/features/javalab/console_only.feature
 *   dashboard/test/ui/features/javalab/finish_button.feature
 *   dashboard/test/ui/features/javalab/javalab_demo_mode.feature
 *   dashboard/test/ui/features/javalab/javalab_submittable.feature
 *   dashboard/test/ui/features/javalab/neighborhood.feature
 *   dashboard/test/ui/features/javalab/prompter.feature
 *   dashboard/test/ui/features/javalab/theater.feature
 */

const LESSON_44 = '/courses/allthethingscourse/units/1/lessons/44';
const FIXTURES = path.resolve(
  __dirname,
  '../../../../../../dashboard/test/fixtures',
);

interface CodeReviewSetup {
  teacher: UserCredentials;
  student0: UserCredentials;
  student1: UserCredentials;
  student0Id: number;
  student1Id: number;
  sectionId: number;
}

interface SectionStudent {
  id: number;
  name: string;
  family_name?: string | null;
  familyName?: string | null;
}

/**
 * Parse a JSON API response and throw a useful error if it failed.
 *
 * @param response - API response to inspect
 * @param action - human-readable action for failure messages
 * @returns parsed JSON body
 */
async function parseJsonResponse<T>(
  response: APIResponse,
  action: string,
): Promise<T> {
  const text = await response.text();
  if (!response.ok()) {
    throw new Error(`${action} failed: ${response.status()} — ${text}`);
  }

  return (text ? JSON.parse(text) : {}) as T;
}

/**
 * Read the current page CSRF token for dashboard JSON requests.
 *
 * @param page - Playwright page holding the active session
 */
async function csrfToken(page: Page): Promise<string> {
  return (
    (await page.locator('meta[name="csrf-token"]').getAttribute('content')) ??
    ''
  );
}

/**
 * POST JSON as the current signed-in user.
 *
 * @param page - Playwright page holding the active session
 * @param url - dashboard path
 * @param data - JSON request body
 * @param action - human-readable action for failure messages
 * @returns parsed JSON response
 */
async function postJson<T>(
  page: Page,
  url: string,
  data: object,
  action: string,
): Promise<T> {
  return parseJsonResponse<T>(
    await page.request.post(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await csrfToken(page),
      },
      data,
    }),
    action,
  );
}

/**
 * GET JSON as the current signed-in user.
 *
 * @param page - Playwright page holding the active session
 * @param url - dashboard path
 * @param action - human-readable action for failure messages
 * @returns parsed JSON response
 */
async function getJson<T>(page: Page, url: string, action: string): Promise<T> {
  return parseJsonResponse<T>(await page.request.get(url), action);
}

/**
 * Sign in, retrying the full reset-session flow if dashboard rejects a stale
 * CSRF token under heavy parallel load.
 *
 * @param page - Playwright page
 * @param email - user's login email
 * @param password - user's password
 */
async function signIn(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await dashboardSignIn(page, email, password);
      return;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (
        !message.includes('InvalidAuthenticityToken') &&
        !message.includes('422')
      ) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Resolve a student id from the teacher's section roster.
 *
 * @param page - Playwright page signed in as the section teacher
 * @param sectionId - dashboard section id
 * @param studentName - student display name
 * @returns dashboard user id for the student
 */
async function getSectionStudentId(
  page: Page,
  sectionId: number,
  studentName: string,
): Promise<number> {
  const students = await getJson<SectionStudent[]>(
    page,
    `/dashboardapi/sections/${sectionId}/students`,
    'get section students',
  );
  const student = students.find(candidate => {
    const fullName = [
      candidate.name,
      candidate.family_name ?? candidate.familyName ?? '',
    ]
      .join(' ')
      .trim();
    return candidate.name === studentName || fullName === studentName;
  });

  if (!student) {
    throw new Error(`could not find section student named ${studentName}`);
  }

  return student.id;
}

/**
 * Create an authorized teacher with a CSA section and sign in as its student.
 * Mirrors Cucumber's `I create a student named "..." in a CSA section`.
 *
 * @param page - Playwright page receiving the student session
 * @param studentName - optional display name for the enrolled student
 * @returns teacher and student credentials plus section id
 */
async function createAuthorizedCsaStudent(
  page: Page,
  studentName?: string,
): Promise<{
  teacher: UserCredentials;
  student: UserCredentials;
  sectionId: number;
}> {
  const teacher = await createAuthorizedTeacher(page);
  const {sectionCode, sectionId} = await createSectionWithCourse(
    page,
    'ui-test-csa-family-script',
    1,
  );
  const student = await createStudent(page, {name: studentName});
  await joinSection(page, sectionCode);
  return {teacher, student, sectionId};
}

/**
 * Create a teacher with levelbuilder access and leave the session signed in.
 * Mirrors Cucumber's `I create a levelbuilder named "..."`.
 *
 * @param page - Playwright page receiving the levelbuilder session
 * @param name - display name for the levelbuilder user
 * @returns credentials for the new levelbuilder
 */
async function createLevelbuilder(
  page: Page,
  name: string,
): Promise<UserCredentials> {
  const credentials = await createTeacher(page, {name});
  await postJson(
    page,
    '/api/test/levelbuilder_access',
    {},
    'grant levelbuilder access',
  );
  return credentials;
}

/**
 * Create two students in one authorized CSA code-review group.  This mirrors
 * Cucumber's `I set up code review for teacher ... with 2 students in a group`
 * without depending on React Beautiful DnD in test setup.
 *
 * @param page - Playwright page receiving the final student_0 session
 * @returns credentials and section id for the code-review group
 */
async function setupCodeReviewGroup(page: Page): Promise<CodeReviewSetup> {
  const teacher = await createAuthorizedTeacher(page);
  const {sectionCode, sectionId} = await createSectionWithCourse(
    page,
    'ui-test-csa-family-script',
    1,
  );
  const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  const student0 = await createStudent(page, {
    name: `ReviewStudent0${suffix}`,
  });
  await joinSection(page, sectionCode);
  const student1 = await createStudent(page, {
    name: `ReviewStudent1${suffix}`,
  });
  await joinSection(page, sectionCode);

  await signIn(page, teacher.email, teacher.password);
  await page.goto('/', {waitUntil: 'domcontentloaded'});

  const currentGroups = await getJson<{
    groups: Array<{
      unassigned?: boolean;
      members: Array<{follower_id: number; name: string}>;
    }>;
  }>(
    page,
    `/api/v1/sections/${sectionId}/code_review_groups`,
    'get code review groups',
  );
  const unassigned = currentGroups.groups.find(group => group.unassigned);
  if (!unassigned || unassigned.members.length < 2) {
    throw new Error('expected at least two unassigned code-review members');
  }

  await postJson(
    page,
    `/api/v1/sections/${sectionId}/code_review_groups`,
    {
      groups: [
        {
          name: 'review group',
          members: unassigned.members.map(member => ({
            follower_id: member.follower_id,
          })),
        },
      ],
    },
    'set code review groups',
  );
  await postJson(
    page,
    `/api/v1/sections/${sectionId}/code_review_enabled`,
    {enabled: true},
    'enable code review',
  );
  const student0Id = await getSectionStudentId(
    page,
    sectionId,
    student0.displayName,
  );
  const student1Id = await getSectionStudentId(
    page,
    sectionId,
    student1.displayName,
  );
  await signIn(page, student0.email, student0.password);

  return {teacher, student0, student1, student0Id, student1Id, sectionId};
}

// ---------------------------------------------------------------------------
// Commit code (commit_code.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — commit code', () => {
  test.beforeEach(async ({page}) => {
    await createTeacherAssociatedStudent(page);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/commit_code.feature
   * Scenario: Open the commit code dialog, enter commit notes, commit, and see commit in version history.
   */
  test(
    'commit with notes appears in version history',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto(`${LESSON_44}/levels/1?noautoplay=true`);
      await page
        .locator('#javalab-editor-save')
        .waitFor({state: 'visible', timeout: 30_000});

      // Ensure the commit points at a fresh saved object version.  Without a
      // source edit, the version-history request can race against autosave and
      // show only the initial/autosave rows.
      await page.getByRole('textbox').first().click();
      await page.keyboard.insertText('// commit test\n');
      await expect(page.locator('.project_updated_at')).toContainText('Saved', {
        timeout: 60_000,
      });

      // Open commit dialog and enter notes.
      await page.locator('#javalab-editor-save').click();
      await page
        .locator('#commit-notes')
        .waitFor({state: 'visible', timeout: 15_000});
      await page.locator('#commit-notes').fill('my commit notes');
      await expect(page.locator('#commit-notes')).toHaveValue(
        'my commit notes',
      );

      // Confirm commit.  The dialog closes only after POST /project_commits
      // succeeds (see onCommitCode → fetch.then → handleCommitSaveSuccess →
      // handleClose), so waiting for the dialog to hide is sufficient to
      // guarantee the commit is persisted before we open version history.
      const commitSaved = page.waitForResponse(
        resp =>
          resp.url().includes('/project_commits') &&
          resp.request().method() === 'POST',
        {timeout: 30_000},
      );
      await page.locator('#confirmationButton').click();
      await commitSaved;
      await page
        .locator('#commit-notes')
        .waitFor({state: 'hidden', timeout: 15_000});

      // Open version history.
      await page.locator('#data-mode-versions-header').click();
      await page.locator('.modal').waitFor({state: 'visible', timeout: 15_000});

      // Both rows must be present.  Assert by content (server ordering may vary).
      await expect(
        page.locator('.modal tr', {hasText: 'my commit notes'}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.locator('.modal tr', {hasText: 'Initial version'}),
      ).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/commit_code.feature
   * Scenario: Open the commit code dialog and try committing without notes, student should not be able to submit.
   */
  test(
    'committing without notes leaves dialog open',
    {tag: '@no_mobile'},
    async ({page}) => {
      const lab = new JavaLabPage(page);
      await page.goto(`${LESSON_44}/levels/1?noautoplay=true`);
      await expect(lab.commitCodeButton).toBeVisible({timeout: 30_000});

      await lab.commitCodeButton.click();
      await expect(lab.commitNotes).toBeVisible({timeout: 15_000});

      // Without notes the confirm button is disabled — clicking is blocked.
      // Verify the invariant directly: the button must be disabled.
      await expect(lab.confirmButton).toBeDisabled();
    },
  );
});

// ---------------------------------------------------------------------------
// Code review finish button (code_review_finish_button.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — code review finish button', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/code_review_finish_button.feature
   * Scenario: Running code in your own code review does not enable the finish button
   */
  test(
    'running code in own code review keeps finish disabled',
    {tag: ['@no_mobile', '@no_ci']},
    async ({page}) => {
      const setup = await setupCodeReviewGroup(page);
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(2);
      await lab.commitCode('my first commit');
      await lab.openNewCodeReview();
      await lab.gotoLevel(
        2,
        `viewingCodeReview=true&user_id=${setup.student0Id}&noautoplay=true`,
      );
      await lab.openReviewTab();
      await lab.waitForOpenReviewInTimeline();
      await expect(lab.finishButton).toBeDisabled();

      await lab.runConsoleProgram('Harry');
      await expect(lab.finishButton).toBeDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/code_review_finish_button.feature
   * Scenario: Running code in your peer's code review does not enable the finish button
   */
  test(
    "running code in peer's code review keeps finish disabled",
    {tag: ['@no_mobile', '@no_ci']},
    async ({page}) => {
      const setup = await setupCodeReviewGroup(page);
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(2);
      await lab.commitCode('my first commit');
      await lab.openNewCodeReview();
      await signIn(page, setup.student1.email, setup.student1.password);

      await lab.gotoLevel(2);
      await lab.loadPeerCodeReview(1);
      await expect(lab.finishButton).toBeDisabled();

      await lab.runConsoleProgram('Harry');
      await expect(lab.finishButton).toBeDisabled();
    },
  );
});

// ---------------------------------------------------------------------------
// Code review V2 (code_review_scenarios.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — code review V2', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/code_review_scenarios.feature
   * Scenario: Code review V2
   */
  test(
    'student, peer, and teacher can view a code review',
    {tag: ['@no_mobile', '@eyes']},
    async ({page}) => {
      test.slow();
      const setup = await setupCodeReviewGroup(page);
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(2);
      await lab.editSourceForNewVersion();
      await lab.commitCode('my first commit');
      await lab.openReviewTab();
      await lab.waitForCommitInReviewTimeline();
      await lab.openNewCodeReview();
      // Eyes checkpoint in Cucumber: owner sees the open review timeline.

      await signIn(page, setup.student1.email, setup.student1.password);
      await lab.gotoLevel(2);
      await lab.loadPeerCodeReview(1);
      // Eyes checkpoint in Cucumber: student code reviewing peer.

      await signIn(page, setup.teacher.email, setup.teacher.password);
      const student0Id = await getSectionStudentId(
        page,
        setup.sectionId,
        setup.student0.displayName,
      );
      await lab.gotoLevel(
        2,
        `section_id=${setup.sectionId}&user_id=${student0Id}&noautoplay=true`,
      );
      await lab.selectReviewTab();
      await expect(
        page.getByText(`Code Reviewing ${setup.student0.displayName}`),
      ).toBeVisible({timeout: 30_000});
      // Eyes checkpoint in Cucumber: teacher code reviewing student.

      await signIn(page, setup.student0.email, setup.student0.password);
      await lab.gotoLevel(2);
      await lab.openReviewTab();
      await expect(lab.closeCodeReviewButton).toBeVisible({timeout: 30_000});
      // Eyes checkpoint in Cucumber: student viewing own code review.
      await lab.closeOwnCodeReview();
    },
  );
});

// ---------------------------------------------------------------------------
// Console-only Java Lab (console_only.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — console-only level', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/console_only.feature
   * Scenario: Console only level responds to text input from user
   */
  test(
    'console-only level responds to text input from user',
    {tag: ['@no_mobile', '@eyes', '@no_ci']},
    async ({page}) => {
      await createAuthorizedCsaStudent(page);
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(2);
      await expect(page.locator('#levelbuilder-menu-toggle')).not.toBeVisible();
      // Eyes checkpoint in Cucumber: initial page load.

      await lab.runConsoleProgram('Harry');
      await expect(lab.console).toContainText('Hello Harry!');
      // Eyes checkpoint in Cucumber: program completed.
    },
  );
});

// ---------------------------------------------------------------------------
// Java Lab demo mode (javalab_demo_mode.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — demo mode', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/javalab_demo_mode.feature
   * Scenario: Present captcha challenge
   */
  test(
    'unverified teacher sees captcha challenge before running Java Lab',
    {tag: ['@no_mobile', '@eyes', '@no_ci']},
    async ({page}) => {
      await createTeacher(page, {name: 'Ms_Frizzle'});
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(4);
      await expect(lab.teacherPanel).not.toBeVisible();
      await lab.runButton.click();
      await expect(lab.captchaDialog).toBeVisible({timeout: 60_000});
      await expect(lab.captchaDialog).toContainText(
        "Please confirm you're human",
      );
      await expect(
        page.frameLocator('iframe[title="reCAPTCHA"]').locator('body'),
      ).toBeVisible({timeout: 30_000});
      await expect(lab.console).toContainText(
        "Verification required: please confirm you're human.",
      );
      // visual checkpoint: "initial modal view"
    },
  );
});

// ---------------------------------------------------------------------------
// Finish button (finish_button.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — finish button', () => {
  test.beforeEach(async ({page}) => {
    await createAuthorizedCsaStudent(page);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/finish_button.feature
   * Scenario: Finish button goes from disabled to enabled on run
   */
  test(
    'finish button goes from disabled to enabled on run',
    {tag: '@no_ci'},
    async ({page}) => {
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(1);
      await expect(lab.finishButton).toBeDisabled();
      await lab.runButton.click();
      await expect(lab.finishButton).toBeEnabled({timeout: 60_000});
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/finish_button.feature
   * Scenario: Finish button does not become enabled if tests fail
   */
  test(
    'finish button does not become enabled if tests fail',
    {tag: '@no_ci'},
    async ({page}) => {
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(11);
      await lab.runValidationTests();
      await expect(lab.finishButton).toBeDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/finish_button.feature
   * Scenario: Finish button becomes enabled if tests succeed
   */
  test(
    'finish button becomes enabled if tests succeed',
    {tag: '@no_ci'},
    async ({page}) => {
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(12);
      await lab.runValidationTests();
      await expect(lab.finishButton).toBeEnabled();
    },
  );
});

// ---------------------------------------------------------------------------
// Java Lab visual levels (theater.feature, prompter.feature, neighborhood.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — visual level flows', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/theater.feature
   * Scenario: GIF plays on run
   */
  test(
    'theater GIF level runs through video generation',
    {tag: ['@eyes', '@no_ci']},
    async ({page}) => {
      await createLevelbuilder(page, 'Simone');
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(4);
      await lab.clickLevelbuilderToggle();
      // visual checkpoint: "initial page load"
      await lab.runButton.click();
      await expect(lab.console).toContainText('[JAVALAB] Program completed.', {
        timeout: 90_000,
      });
      // visual checkpoint: "GIF end state"
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/prompter.feature
   * Scenario: Upload an image via the prompter
   */
  test(
    'prompter level accepts an uploaded image and completes',
    {tag: ['@eyes', '@no_ci']},
    async ({page}) => {
      await createLevelbuilder(page, 'Simone');
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(10);
      await lab.clickLevelbuilderToggle();
      // visual checkpoint: "initial page load"
      await lab.runButton.click();
      await expect(lab.console).toContainText('Upload a photo!', {
        timeout: 60_000,
      });
      await expect(lab.photoInput).toBeAttached({timeout: 30_000});
      // visual checkpoint: "prompter upload view"
      await lab.photoInput.setInputFiles(
        path.join(FIXTURES, 'javalab_image.jpg'),
      );
      await expect(lab.console).toContainText('[JAVALAB] Program completed.', {
        timeout: 90_000,
      });
      // visual checkpoint: "prompter end state"
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/neighborhood.feature
   * Scenario: Paint Glomming Shapes
   */
  test(
    'neighborhood paint glomming level runs to completion',
    {tag: ['@eyes', '@no_ci']},
    async ({page}) => {
      test.slow();
      await createLevelbuilder(page, 'Simone');
      const lab = new JavaLabPage(page);

      await lab.gotoLevel(7);
      await lab.clickLevelbuilderToggle();
      await lab.setNeighborhoodSpeedToFast();
      // visual checkpoint: "initial page load"
      await lab.runButton.click();
      await expect(lab.console).toContainText('Done painting', {
        timeout: 180_000,
      });
      // visual checkpoint: "paint glomming"
    },
  );
});

// ---------------------------------------------------------------------------
// Submittable Java Lab (javalab_submittable.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — submittable level', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/javalab_submittable.feature
   * Scenario: Submit anything, unsubmit, be able to resubmit.
   */
  test(
    'submit, unsubmit, and resubmit cycle restores submit state',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacherAssociatedStudent(page);
      const lab = new JavaLabPage(page);

      const LEVEL_URL = `${LESSON_44}/levels/9?noautoplay=true`;
      await page.goto(LEVEL_URL);
      await lab.waitForReady();

      // Run code so the submit button becomes available.
      await lab.runButton.click();
      await expect(lab.submitButton).toBeVisible({timeout: 60_000});

      // Submit and confirm.
      await lab.submitButton.click();
      await page.locator('.modal').waitFor({state: 'visible'});
      await page
        .locator('.modal')
        .getByRole('button', {name: /^ok/i})
        .waitFor({state: 'visible', timeout: 15_000});
      // Submit OK triggers window.location.href redirect; wait for navigation.
      await Promise.all([
        page.waitForNavigation({waitUntil: 'load', timeout: 30_000}),
        page.locator('.modal').getByRole('button', {name: /^ok/i}).click(),
      ]);

      // Reload: unsubmit button visible; submit button gone.
      await page.goto(LEVEL_URL);
      await expect(lab.unsubmitButton).toBeVisible({timeout: 30_000});
      await expect(lab.submitButton).not.toBeVisible();

      // Unsubmit and confirm.
      await lab.runButton.click();
      await lab.unsubmitButton.click();
      await page.locator('.modal').waitFor({state: 'visible'});
      await page
        .locator('.modal')
        .getByRole('button', {name: /^ok/i})
        .waitFor({state: 'visible', timeout: 15_000});
      // Unsubmit OK triggers location.reload(); wait for the reload.
      await Promise.all([
        page.waitForNavigation({waitUntil: 'load', timeout: 30_000}),
        page.locator('.modal').getByRole('button', {name: /^ok/i}).click(),
      ]);

      // After unsubmit, run again to restore submit button.
      await page.goto(LEVEL_URL);
      await lab.waitForReady();
      await lab.runButton.click();
      await expect(lab.submitButton).toBeVisible({timeout: 60_000});
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/javalab/javalab_submittable.feature
   * Scenario: Submit anything, teacher is able to unsubmit
   */
  test(
    'teacher can unsubmit on behalf of student',
    {tag: '@no_mobile'},
    async ({page}) => {
      const studentName = `JavaLabStudent${Date.now()}${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const {teacherEmail, teacherPassword, sectionId, studentDisplayName} =
        await createTeacherAssociatedStudent(page, {studentName});
      const lab = new JavaLabPage(page);
      const levelUrl = `${LESSON_44}/levels/9?noautoplay=true`;

      await page.goto(levelUrl, {waitUntil: 'domcontentloaded'});
      await lab.waitForReady();
      await lab.submitLevel();

      await page.goto(levelUrl, {waitUntil: 'domcontentloaded'});
      await expect(lab.unsubmitButton).toBeVisible({timeout: 30_000});

      await signIn(page, teacherEmail, teacherPassword);
      const studentId = await getSectionStudentId(
        page,
        sectionId,
        studentDisplayName,
      );
      await lab.gotoLevel(
        9,
        `section_id=${sectionId}&user_id=${studentId}&noautoplay=true`,
      );

      await expect(lab.teacherUnsubmitButton).toBeEnabled({timeout: 30_000});
      await lab.teacherUnsubmitButton.click();
      await expect(lab.teacherUnsubmitButton).toBeDisabled({timeout: 30_000});
    },
  );
});
