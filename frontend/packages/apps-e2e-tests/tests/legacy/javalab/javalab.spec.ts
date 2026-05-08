import {createTeacherAssociatedStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Java Lab — commit code, finish button, and submittable level scenarios.
 *
 * Sources:
 *   dashboard/test/ui/features/javalab/commit_code.feature
 *   dashboard/test/ui/features/javalab/finish_button.feature
 *   dashboard/test/ui/features/javalab/javalab_submittable.feature
 *
 * Skipped (all @eyes and/or @no_ci with visual assertions or complex infra):
 *   code_review_finish_button.feature — @no_ci + custom code-review group setup
 *   code_review_scenarios.feature     — @eyes + same group setup
 *   console_only.feature              — @eyes + @no_ci
 *   javalab_demo_mode.feature         — @eyes + @no_ci + reCAPTCHA
 *   neighborhood.feature              — @eyes + @no_ci
 *   prompter.feature                  — @eyes + @no_ci + file upload
 *   theater.feature                   — @eyes + @no_ci + 15s wait
 */

// Fixme stubs — @eyes / @no_ci with no porteable non-visual steps.
test.fixme(
  'code review: running code in own review does not enable finish button',
  async () => {},
);
test.fixme('code review V2: full peer-review flow', async () => {});
test.fixme('console only level responds to text input', async () => {});

const LESSON_44 = '/courses/allthethingscourse/units/1/lessons/44';

// ---------------------------------------------------------------------------
// Commit code (commit_code.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — commit code', () => {
  test.beforeEach(async ({page}) => {
    await createTeacherAssociatedStudent(page);
  });

  test(
    'commit with notes appears in version history',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto(`${LESSON_44}/levels/1?noautoplay=true`);
      await page
        .locator('#javalab-editor-save')
        .waitFor({state: 'visible', timeout: 30_000});

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

  test(
    'committing without notes leaves dialog open',
    {tag: '@no_mobile'},
    async ({page}) => {
      await page.goto(`${LESSON_44}/levels/1?noautoplay=true`);
      await page
        .locator('#javalab-editor-save')
        .waitFor({state: 'visible', timeout: 30_000});

      await page.locator('#javalab-editor-save').click();
      await page
        .locator('#commit-notes')
        .waitFor({state: 'visible', timeout: 15_000});

      // Without notes the confirm button is disabled — clicking is blocked.
      // Verify the invariant directly: the button must be disabled.
      await expect(page.locator('#confirmationButton')).toBeDisabled();
    },
  );
});

// ---------------------------------------------------------------------------
// Finish button (finish_button.feature)
//
// All scenarios tagged @no_ci in the legacy suite — they require a live
// Javabuilder WebSocket connection to compile and run Java code.
// Run these manually against test-studio; skip in automated CI.
// ---------------------------------------------------------------------------

test.describe('Java Lab — finish button', () => {
  test.beforeEach(async ({page}) => {
    // Original feature uses "student in CSA section" (creates teacher with
    // authorized access + section assigned to ui-test-csa-family-script).
    // createTeacherAssociatedStudent is sufficient on test-studio since
    // allthethingscourse lesson 44 is accessible to any enrolled student.
    await createTeacherAssociatedStudent(page);
  });

  test(
    'finish button goes from disabled to enabled on run',
    {tag: '@no_ci'},
    async ({page}) => {
      await page.goto(`${LESSON_44}/levels/1?noautoplay=true`);
      await page
        .locator('#finishButton')
        .waitFor({state: 'visible', timeout: 30_000});

      await expect(page.locator('#finishButton')).toBeDisabled();
      await page.locator('#runButton').click();
      await expect(page.locator('#finishButton')).toBeEnabled({
        timeout: 60_000,
      });
    },
  );

  test(
    'finish button does not become enabled if tests fail',
    {tag: '@no_ci'},
    async ({page}) => {
      await page.goto(`${LESSON_44}/levels/11?noautoplay=true`);
      await page
        .locator('#finishButton')
        .waitFor({state: 'visible', timeout: 30_000});

      await page.locator('#testButton').click();
      await expect(page.locator('.javalab-console')).toContainText(
        '[JAVALAB] Program completed.',
        {timeout: 60_000},
      );
      await expect(page.locator('#finishButton')).toBeDisabled();
    },
  );

  test(
    'finish button becomes enabled if tests succeed',
    {tag: '@no_ci'},
    async ({page}) => {
      await page.goto(`${LESSON_44}/levels/12?noautoplay=true`);
      await page
        .locator('#finishButton')
        .waitFor({state: 'visible', timeout: 30_000});

      await page.locator('#testButton').click();
      await expect(page.locator('.javalab-console')).toContainText(
        '[JAVALAB] Program completed.',
        {timeout: 60_000},
      );
      await expect(page.locator('#finishButton')).toBeEnabled();
    },
  );
});

// ---------------------------------------------------------------------------
// Submittable Java Lab (javalab_submittable.feature)
// ---------------------------------------------------------------------------

test.describe('Java Lab — submittable level', () => {
  test(
    'submit, unsubmit, and resubmit cycle restores submit state',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacherAssociatedStudent(page);

      const LEVEL_URL = `${LESSON_44}/levels/9?noautoplay=true`;
      await page.goto(LEVEL_URL);
      await page
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 30_000});

      // Run code so the submit button becomes available.
      await page.locator('#runButton').click();
      await page
        .locator('#submitButton')
        .waitFor({state: 'visible', timeout: 60_000});

      // Submit and confirm.
      await page.locator('#submitButton').click();
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
      await page
        .locator('#unsubmitButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page.locator('#submitButton')).not.toBeVisible();

      // Unsubmit and confirm.
      await page.locator('#runButton').click();
      await page.locator('#unsubmitButton').click();
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
      await page
        .locator('#runButton')
        .waitFor({state: 'visible', timeout: 30_000});
      await page.locator('#runButton').click();
      await page
        .locator('#submitButton')
        .waitFor({state: 'visible', timeout: 60_000});
    },
  );

  test.fixme('teacher can unsubmit on behalf of student', async () => {});
});
