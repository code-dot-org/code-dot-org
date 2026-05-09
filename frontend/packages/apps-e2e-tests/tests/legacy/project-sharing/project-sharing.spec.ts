import {createStudent} from '../../shared/auth';
import {type Page, expect, test} from '../../shared/fixtures';

/**
 * Project Sharing — Young Students.
 *
 * Source: dashboard/test/ui/features/teacher_tools/projects/project_sharing.feature
 *
 * All scenarios use a young student (age 10, under 13).  Non-open-ended
 * project types (dance) allow URL sharing unconditionally.  Open-ended
 * project types (spritelab) require a teacher section — without one the share
 * button shows a disabled state (#uitest-sharing-disabled-button).  AppLab is
 * age-restricted: navigating to /projects/applab/new redirects to /home.
 */

/**
 * Create a new project of the given type as the currently signed-in user.
 * Navigates to /projects/<type>/new, waits for the redirect to /edit, and
 * waits for the first autosave to complete.
 * Mirrors the relevant steps in `I make a "<type>" project named "..."` from
 * project_steps.rb (renaming omitted — not required for these scenarios).
 *
 * @param page - Playwright page
 * @param type - project type slug, e.g. 'dance', 'spritelab'
 */
async function makeProject(page: Page, type: string): Promise<void> {
  await page.goto(`/projects/${type}/new`);
  await page.waitForURL(new RegExp(`/projects/${type}/[^/]+/edit`), {
    timeout: 60_000,
  });
  await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
  await expect(page.locator('.project_updated_at')).toContainText('Saved', {
    timeout: 60_000,
  });
}

test.describe('Project Sharing — Young Students', {tag: '@no_mobile'}, () => {
  /**
   * Source: "Share dialog can be opened and closed"
   */
  test('share dialog opens and closes', async ({page}) => {
    await createStudent(page, {age: 10, us_state: 'CO'});
    await makeProject(page, 'dance');

    await page.locator('.project_share').first().click();
    await expect(page.locator('#project-share')).toBeVisible({
      timeout: 15_000,
    });

    await page.locator('#x-close').click();
    await expect(page.locator('#project-share')).not.toBeAttached({
      timeout: 10_000,
    });
  });

  /**
   * Source: "Young Student Can Share Non-Open-ended Projects via URL"
   */
  test('non-open-ended project (dance) share button is enabled', async ({
    page,
  }) => {
    await createStudent(page, {age: 10, us_state: 'CO'});
    await makeProject(page, 'dance');

    await page.locator('.project_share').first().click();
    await expect(page.locator('#project-share')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('#sharing-dialog-copy-button')).toBeEnabled({
      timeout: 10_000,
    });
  });

  /**
   * Source: "Young Student Not In Teacher Section Cannot Share Open-ended Projects via URL"
   */
  test('open-ended project (spritelab) without teacher section shows disabled share', async ({
    page,
  }) => {
    await createStudent(page, {age: 10, us_state: 'CO'});
    await makeProject(page, 'spritelab');

    await page.locator('.project_share').first().click();
    await expect(page.locator('#uitest-sharing-disabled-button')).toBeVisible({
      timeout: 15_000,
    });
  });

  /**
   * Source: "Young Students Can Not By Default Make App Lab Projects"
   */
  test('applab new redirects young student to /home', async ({page}) => {
    await createStudent(page, {age: 10, us_state: 'CO'});

    await page.goto('/projects/applab/new');
    await page.waitForURL(/\/home/, {timeout: 30_000});
    await expect(page.locator('.alert')).toBeVisible({timeout: 15_000});
  });
});
