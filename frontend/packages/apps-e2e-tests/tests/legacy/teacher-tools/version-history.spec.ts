import {createTeacherAssociatedStudent, signIn} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Version History in Teacher View.
 *
 * Source: dashboard/test/ui/features/teacher_tools/version_history.feature
 *
 * allthethingscourse unit 1 lesson 18 level 1 — App Lab (droplet/JS) level.
 */

const LEVEL_URL = '/courses/allthethingscourse/units/1/lessons/18/levels/1';

/**
 * Ensure the droplet editor is in text mode.
 * Mirrors `I ensure droplet is in text mode` from droplet_steps.rb:
 *   if #show-code-header text === 'Show Text', click it.
 *
 * Uses page.evaluate to click so the teacher-panel overlay cannot intercept.
 *
 * @param page - Playwright page with an App Lab level loaded
 */
async function ensureTextMode(
  page: import('@playwright/test').Page,
): Promise<void> {
  const buttonText = await page.evaluate(
    () => document.querySelector('#show-code-header')?.textContent,
  );
  if (buttonText === 'Show Text') {
    await page.evaluate(() =>
      (document.querySelector('#show-code-header') as HTMLElement)?.click(),
    );
    await page
      .locator('.ace_editor')
      .waitFor({state: 'visible', timeout: 10_000});
  }
}

/**
 * Add a comment to the ace editor to mark a new version.
 * Mirrors `I add code "// comment A" to ace editor` from droplet_steps.rb.
 * Uses `__TestInterface.getDroplet().aceEditor.onTextInput()`.
 *
 * @param page - Playwright page with the droplet editor in text mode
 */
async function addCodeToAce(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = (window as any).__TestInterface?.getDroplet?.();
    if (d) {
      d.aceEditor.textInput.focus();
      d.aceEditor.onTextInput('// comment A');
    }
  });
}

/**
 * Add another project version: ensure text mode → inject comment → reset (if
 * running) → run.  Mirrors `I add another version to the project` from steps.rb.
 *
 * Reset is conditional: it is only needed when the app is currently running.
 * If it has already stopped the button is hidden/disabled and we skip it.
 *
 * @param page - Playwright page with App Lab level loaded
 */
async function addAnotherVersion(
  page: import('@playwright/test').Page,
): Promise<void> {
  await ensureTextMode(page);
  await addCodeToAce(page);
  const resetButton = page.locator('#resetButton');
  if (await resetButton.isVisible({timeout: 3_000}).catch(() => false)) {
    await resetButton.click();
  }
  await page.locator('#runButton').waitFor({state: 'visible', timeout: 10_000});
  await page.locator('#runButton').click();
}

/**
 * Set the project auto-save version interval.
 * Mirrors `I set the project version interval to N seconds` from project_steps.rb.
 *
 * @param page - Playwright page with an App Lab project loaded
 * @param seconds - version save interval in seconds
 */
async function setVersionInterval(
  page: import('@playwright/test').Page,
  seconds: number,
): Promise<void> {
  await page.evaluate(s => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dashboard.project.__TestInterface.setSourceVersionInterval(
      s,
    );
  }, seconds);
}

/**
 * Dismiss the teacher panel if it is currently expanded.
 * Mirrors `I dismiss the teacher panel` from steps.rb.
 *
 * Uses page.evaluate for the click to bypass any overlay interception.
 *
 * @param page - Playwright page with a teacher panel present
 */
async function dismissTeacherPanel(
  page: import('@playwright/test').Page,
): Promise<void> {
  const handle = page.locator('.show-handle .fa-chevron-left');
  if (await handle.isVisible({timeout: 5_000}).catch(() => false)) {
    await page.evaluate(() => {
      (
        document.querySelector('.show-handle .fa-chevron-left') as HTMLElement
      )?.click();
    });
    await page
      .locator('.hide-handle .fa-chevron-right')
      .waitFor({state: 'visible', timeout: 10_000});
  }
}

test.describe('Version History in Teacher View', {tag: '@no_mobile'}, () => {
  /**
   * Source: version_history.feature — "Teacher can view student versions"
   *
   * Student creates two versions of the project; teacher views the version
   * history and confirms the Restore button is absent (teachers cannot
   * restore a student's version).
   */
  test('teacher sees student versions without Restore button', async ({
    page,
  }) => {
    test.fixme(
      true,
      'TODO: locator.waitFor timeout in teacher version history view on webkit',
    );
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {authorized: true});

    // --- Student: create two project versions ---
    await page.goto(LEVEL_URL);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});
    await page.locator('#runButton').click();

    await page.locator('#show-code-header').click();
    await addAnotherVersion(page);

    await expect(page.locator('.project_updated_at')).toContainText('Saved', {
      timeout: 30_000,
    });

    // Open version history dialog and save the first row's label.
    await page.locator('#versions-header').click();
    await page
      .locator('div')
      .filter({hasText: 'Latest Version'})
      .first()
      .waitFor({state: 'visible', timeout: 15_000});
    const firstVersionLabel = await page
      .locator('.versionRow:nth-child(1) p')
      .textContent();

    // Close dialog, shorten interval, wait, then add a second version.
    await page.locator('#x-close').click();
    await setVersionInterval(page, 1);
    await page.waitForTimeout(1500);
    await addAnotherVersion(page);

    await expect(page.locator('.project_updated_at')).toContainText('Saved', {
      timeout: 30_000,
    });

    // Re-open version history; second row should carry the first row's label.
    await page.locator('#versions-header').click();
    await page
      .locator('div')
      .filter({hasText: 'Latest Version'})
      .first()
      .waitFor({state: 'visible', timeout: 15_000});

    const secondRowLabel = await page
      .locator('.versionRow:nth-child(2) p')
      .textContent();
    expect(secondRowLabel).toBe(firstVersionLabel);
    await expect(
      page.locator('.versionRow:nth-child(2) .img-upload'),
    ).toContainText('Restore');

    // --- Teacher: same level, view student's version history ---
    await signIn(page, teacherEmail, teacherPassword);
    await page.goto(LEVEL_URL);
    await page
      .locator('.student-table')
      .waitFor({state: 'visible', timeout: 15_000});

    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#teacher-panel-container tr').nth(1).click(),
    ]);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});

    await dismissTeacherPanel(page);

    await page.evaluate(() =>
      (document.querySelector('#versions-header') as HTMLElement)?.click(),
    );
    await page
      .locator('div')
      .filter({hasText: 'Latest Version'})
      .first()
      .waitFor({state: 'visible', timeout: 30_000});

    await expect(
      page.locator('.versionRow:nth-child(1) .img-upload'),
    ).not.toBeAttached();
    await expect(
      page.locator('.versionRow:nth-child(2) .img-upload'),
    ).not.toBeAttached();
  });

  /**
   * Source: version_history.feature — "Teacher can view own versions"
   *
   * Teacher creates two versions of the project and can see the Restore
   * button on past versions (unlike when viewing a student's work).
   */
  test('teacher sees own versions with Restore button', async ({page}) => {
    const {teacherEmail, teacherPassword} =
      await createTeacherAssociatedStudent(page, {authorized: true});

    await signIn(page, teacherEmail, teacherPassword);
    await page.goto(LEVEL_URL);
    await page
      .locator('#runButton')
      .waitFor({state: 'visible', timeout: 30_000});

    await dismissTeacherPanel(page);

    await page.locator('#runButton').click();
    await addAnotherVersion(page);
    await expect(page.locator('.project_updated_at')).toContainText('Saved', {
      timeout: 30_000,
    });

    await page.waitForTimeout(1500);
    await addAnotherVersion(page);
    await expect(page.locator('.project_updated_at')).toContainText('Saved', {
      timeout: 30_000,
    });

    await page.evaluate(() =>
      (document.querySelector('#show-code-header') as HTMLElement)?.click(),
    );
    await page.evaluate(() =>
      (document.querySelector('#versions-header') as HTMLElement)?.click(),
    );
    await page
      .locator('div')
      .filter({hasText: 'Latest Version'})
      .first()
      .waitFor({state: 'visible', timeout: 15_000});

    await expect(
      page.locator('.versionRow:nth-child(2) .img-upload'),
    ).toContainText('Restore');
  });
});
