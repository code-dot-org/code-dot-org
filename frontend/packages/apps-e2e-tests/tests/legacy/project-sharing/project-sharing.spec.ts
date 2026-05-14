import {type Page} from '@playwright/test';

import {createStudent, createTeacher, signOut} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {Dance} from '../activities/dance/Dance';

import {ProjectSharingPage} from './ProjectSharingPage';

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

/**
 * Create a new project from the project-family route, mirroring Cucumber steps
 * that navigate to /projects/<type> and wait for the dashboard redirect.
 *
 * @param page - Playwright page
 * @param type - project type slug, e.g. 'dance', 'starwars'
 */
async function makeProjectFromFamilyRoute(
  page: Page,
  type: string,
): Promise<void> {
  await page.goto(`/projects/${type}`);
  await page.waitForURL(new RegExp(`/projects/${type}/[^/]+/edit`), {
    timeout: 60_000,
  });
  await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
  await expect(page.locator('.project_updated_at')).toContainText('Saved', {
    timeout: 60_000,
  });
}

/**
 * Open the project share dialog and return the URL from its copy control.
 * Mirrors Cucumber's `I open the project share dialog` and
 * `I save the share URL`.
 *
 * @param page - Playwright page on a project edit page
 * @returns absolute share URL copied from the share dialog
 */
async function openShareDialogAndReadUrl(page: Page): Promise<string> {
  await page.locator('.project_share').first().click();
  await expect(page.locator('#project-share')).toBeVisible({timeout: 15_000});
  const copyButton = page.locator('#sharing-dialog-copy-button');
  await expect(copyButton).toBeVisible({timeout: 15_000});
  const shareUrl = await copyButton.getAttribute('value');
  if (!shareUrl) {
    throw new Error('share URL not found in #sharing-dialog-copy-button');
  }
  return shareUrl;
}

/**
 * Rename the current project through the project title edit control.
 * Mirrors the `.project_edit`, `input.project_name`, `.project_save` steps.
 *
 * @param page - Playwright page on a project edit page
 * @param name - project title to save
 */
async function renameProject(page: Page, name: string): Promise<void> {
  await page.locator('.project_edit').click();
  await page.locator('input.project_name').fill(name);
  await page.locator('.project_save').click();
  await expect(page.locator('.project_edit')).toBeVisible({timeout: 15_000});
}

/**
 * Create, rename, run, and save a project so it appears in the personal gallery.
 * Mirrors Cucumber's `I make a "<type>" project named "<name>"`.
 *
 * @param page - Playwright page
 * @param type - project type slug, e.g. 'playlab'
 * @param name - project title to save
 */
async function makeNamedProject(
  page: Page,
  type: string,
  name: string,
): Promise<void> {
  await makeProject(page, type);
  await renameProject(page, name);
  await page.locator('#runButton').click();
  await expect(page.locator('.project_updated_at')).toContainText('Saved', {
    timeout: 60_000,
  });
}

/**
 * Navigate to the personal project gallery and wait for its project table.
 *
 * @param page - authenticated Playwright page
 */
async function gotoPersonalGallery(page: Page): Promise<void> {
  await page.goto('/projects');
  await expect(page.locator('#uitest-personal-projects')).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator('.ui-personal-projects-table')).toBeVisible({
    timeout: 30_000,
  });
}

/**
 * Assert the number of personal project table rows.
 * Mirrors `the project table contains N rows`.
 *
 * @param page - Playwright page on the personal project gallery
 * @param count - expected row count
 */
async function expectProjectRowCount(page: Page, count: number): Promise<void> {
  await expect(page.locator('.ui-personal-projects-row')).toHaveCount(count, {
    timeout: 15_000,
  });
}

/**
 * Assert the first personal gallery project name.
 * Mirrors `the first project in the table is named "<name>"`.
 *
 * @param page - Playwright page on the personal project gallery
 * @param name - expected visible project title
 */
async function expectFirstProjectName(page: Page, name: string): Promise<void> {
  await expect(
    page.locator('.ui-projects-table-project-name').first(),
  ).toContainText(name, {timeout: 15_000});
}

/**
 * Open the first project's action menu in the personal gallery.
 *
 * @param page - Playwright page on the personal project gallery
 */
async function openFirstProjectMenu(page: Page): Promise<void> {
  await page
    .locator('.ui-projects-table-dropdown')
    .first()
    .scrollIntoViewIfNeeded();
  await page.locator('.ui-projects-table-dropdown').first().click();
  await expect(page.locator('.pop-up-menu-item').first()).toBeVisible({
    timeout: 10_000,
  });
}

test.describe('Project Sharing — Young Students', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/project_sharing.feature
   * Scenario: Share dialog can be opened and closed
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/project_sharing.feature
   * Scenario: Young Student Can Share Non-Open-ended Projects via URL
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/project_sharing.feature
   * Scenario: Young Student Not In Teacher Section Cannot Share Open-ended Projects via URL
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
    // Firefox: young student applab redirect flaky under parallel run; passes alone.
    test.fixme(
      true,
      'TODO: applab new young student redirect flaky on firefox under parallel run; session or redirect timing issue',
    );
    await createStudent(page, {age: 10, us_state: 'CO'});

    await page.goto('/projects/applab/new');
    await page.waitForURL(/\/home/, {timeout: 30_000});
    await expect(page.locator('.alert')).toBeVisible({timeout: 15_000});
  });
});

test.describe('Personal Project Gallery', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/personal_project_gallery.feature
   * Scenario: Can Toggle to the Public Project Gallery
   */
  test('can toggle to the public project gallery', async ({page}) => {
    await createStudent(page);
    await page.goto('/projects');
    await expect(page.locator('#uitest-personal-projects')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-public-projects')).not.toBeVisible();

    await page
      .locator('#uitest-gallery-switcher')
      .getByText('Featured Projects')
      .click();
    await page.waitForURL(/\/projects\/public/);
    await expect(page.locator('#uitest-public-projects')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#uitest-personal-projects')).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/personal_project_gallery.feature
   * Scenario: Can Rename a Project
   */
  test('can rename a project from the personal gallery', async ({page}) => {
    await createStudent(page);
    await makeNamedProject(page, 'playlab', 'Old Name');
    await gotoPersonalGallery(page);
    await expectProjectRowCount(page, 1);
    await expectFirstProjectName(page, 'Old Name');

    await openFirstProjectMenu(page);
    await page.locator('.pop-up-menu-item').nth(0).click();
    await expect(page.locator('#ui-project-rename-input')).toBeVisible({
      timeout: 10_000,
    });
    await page.locator('#ui-project-rename-input').fill('New Name');
    await page.locator('#ui-projects-rename-save').click();
    await expect(page.locator('#ui-projects-rename-save')).not.toBeVisible({
      timeout: 10_000,
    });
    await expectFirstProjectName(page, 'New Name');
  });

  /**
   * Source: dashboard/test/ui/features/teacher_tools/projects/personal_project_gallery.feature
   * Scenario: Can Remix a Project
   * @no_safari
   */
  test('can remix a project from the personal gallery', async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName === 'webkit',
      'Source scenario is tagged @no_safari.',
    );
    await createStudent(page);
    await makeNamedProject(page, 'playlab', 'Remix Template');
    await gotoPersonalGallery(page);
    await expectProjectRowCount(page, 1);
    await expectFirstProjectName(page, 'Remix Template');

    await openFirstProjectMenu(page);
    await page.locator('.pop-up-menu-item').nth(1).click();
    await page.waitForURL(/\/edit/, {timeout: 30_000});
    await expect(page.locator('#runButton')).toBeVisible({timeout: 30_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/personal_project_gallery.feature
   * Scenario: Can Delete a Project
   */
  test('can delete a project from the personal gallery', async ({page}) => {
    await createStudent(page);
    await makeNamedProject(page, 'playlab', 'To Be Deleted');
    await gotoPersonalGallery(page);
    await expectProjectRowCount(page, 1);
    await expectFirstProjectName(page, 'To Be Deleted');

    await openFirstProjectMenu(page);
    await page.locator('.pop-up-menu-item').nth(2).click();
    await expect(page.locator('.ui-confirm-project-delete-button')).toBeVisible(
      {timeout: 10_000},
    );
    await page.locator('.ui-confirm-project-delete-button').click();
    await expect(
      page.locator('.ui-confirm-project-delete-button'),
    ).not.toBeVisible({timeout: 10_000});
    await expectProjectRowCount(page, 0);
  });
});

test.describe('Project Sharing — Blockly projects', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/blockly_project.feature
   * Scenario: Save Blockly Project
   */
  test('anonymous Dance project saves block state and shows it on the share page', async ({
    page,
  }) => {
    await page.goto('/reset_session');
    await makeProjectFromFamilyRoute(page, 'dance');

    const dance = new Dance(page);
    await dance.waitForLabPage();
    await dance.appendBlock(
      'Dancelab_makeNewDanceSpriteGroup',
      'studentSpriteGroup',
    );
    await dance.connectBlockInside('studentSpriteGroup', 'setup');

    const shareUrl = await openShareDialogAndReadUrl(page);
    await page.goto(shareUrl);
    await expect(page.locator('#visualization')).toBeVisible({timeout: 30_000});

    await expect(
      page.locator(
        '.blocklySvg g[data-id="setup"] > g[data-id="studentSpriteGroup"]',
      ),
    ).toBeAttached();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/starwars_project.feature
   * Scenario: Starwars Flow
   */
  test('student Star Wars project can be named and opened from its share URL', async ({
    page,
  }) => {
    await createStudent(page);
    await makeProjectFromFamilyRoute(page, 'starwars');
    await renameProject(page, 'Code Ninja III: Revenge of the Semicolon');
    await expect(page).toHaveTitle(
      /Code Ninja III: Revenge of the Semicolon - Play Lab - Code\.org/,
    );

    const shareUrl = await openShareDialogAndReadUrl(page);
    await page.goto(shareUrl);
    await expect(page.getByRole('button', {name: 'How It Works'})).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).toHaveTitle(
      /Code Ninja III: Revenge of the Semicolon - Play Lab - Code\.org/,
    );
    await expect(page.locator('#codeWorkspace')).toBeHidden();
  });
});

test.describe('Game Lab Projects', {tag: '@no_mobile'}, () => {
  /**
   * Source: dashboard/test/ui/features/teacher_tools/projects/gamelab_project.feature
   * Scenario: Gamelab Flow
   */
  test('student Game Lab project routes view-code links by ownership', async ({
    page,
  }) => {
    test.slow();

    await createStudent(page);
    const projectSharing = new ProjectSharingPage(page);
    const gamelab = await projectSharing.makeGameLabProject();
    await page.evaluate(() => localStorage.setItem('is13Plus', 'true'));
    await projectSharing.renameProject('Code Ninja II: Uncaught Exception');
    await expect(page).toHaveTitle(
      /Code Ninja II: Uncaught Exception - Game Lab - Code\.org/,
    );

    await gamelab.ensureTextMode();
    await gamelab.insertCodeAtCursor(
      '\nfunction draw() {\n  background("white");\n}\n',
    );
    await expect(page.locator('.project_updated_at')).toContainText('Saved', {
      timeout: 60_000,
    });

    const shareUrl = await projectSharing.openShareDialogAndReadUrl();

    // Owner: View code opens the editable project.
    await projectSharing.gotoSharePage(shareUrl);
    await expect(page).toHaveTitle(
      /Code Ninja II: Uncaught Exception - Game Lab - Code\.org/,
    );
    await expect(page.locator('#codeWorkspace')).toBeHidden();
    await projectSharing.clickViewCode();
    await expect(page).toHaveURL(/\/projects\/gamelab\/[^/]+\/edit/, {
      timeout: 60_000,
    });
    await projectSharing.expectEditableCodeWorkspace();

    // Owner: footer "How it Works" also opens the editable project.
    await projectSharing.gotoSharePage(shareUrl);
    await projectSharing.openHowItWorksFromFooter();
    await expect(page).toHaveURL(/\/projects\/gamelab\/[^/]+\/edit/, {
      timeout: 60_000,
    });
    await projectSharing.expectEditableCodeWorkspace();

    // Anonymous: View code opens read-only view.
    await signOut(page);
    await projectSharing.gotoSharePage(shareUrl);
    await projectSharing.clickViewCode();
    await expect(page).toHaveURL(/\/projects\/gamelab\/[^/]+\/view/, {
      timeout: 60_000,
    });
    await projectSharing.expectReadonlyCodeWorkspace();

    // Anonymous: footer "How it Works" asks the user to sign in.
    await projectSharing.gotoSharePage(shareUrl);
    await projectSharing.openHowItWorksFromFooter();
    await expect(page).toHaveURL(/\/users\/sign_in/, {timeout: 60_000});

    // Non-owner: direct edit URL redirects to read-only view.
    await createTeacher(page, {name: 'Non-Owner'});
    await page.goto(`${shareUrl}/edit`, {
      timeout: 60_000,
      waitUntil: 'domcontentloaded',
    });
    await expect(page).toHaveURL(/\/projects\/gamelab\/[^/]+\/view/, {
      timeout: 60_000,
    });
    await projectSharing.expectReadonlyCodeWorkspace();
  });

  /**
   * Source: dashboard/test/ui/features/teacher_tools/projects/gamelab_project.feature
   * Scenario: Remix project creates and redirects to new channel
   */
  test('remix project creates and redirects to a new channel', async ({
    page,
  }) => {
    await createStudent(page);
    await makeProjectFromFamilyRoute(page, 'gamelab');
    await page.evaluate(() => localStorage.setItem('is13Plus', 'true'));
    await renameProject(page, 'Code Ninja');
    await expect(page).toHaveTitle(/Code Ninja - Game Lab - Code\.org/);
    const originalUrl = page.url();

    await page.locator('.project_remix').click();
    await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
    await expect(page).toHaveTitle(/Remix: Code Ninja - Game Lab - Code\.org/);
    expect(page.url()).toContain('/projects/gamelab');
    expect(page.url()).toContain('/edit');
    expect(page.url()).not.toBe(originalUrl);
    await page.locator('#runButton').click();
  });
});
