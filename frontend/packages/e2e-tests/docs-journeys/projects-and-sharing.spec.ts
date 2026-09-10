import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createStudent, createUser} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

test.describe('projects and sharing', () => {
  test('project list orientation and region crops', async ({page}) => {
    await page.goto('/');
    await createStudent(page, {name: 'ProjectImgStudent', age: '16'});

    // Create three projects in different labs so the list looks realistic.
    for (const lab of ['artist', 'spritelab', 'dance']) {
      await page.goto(`/projects/${lab}/new`);
      await page.waitForURL('**/edit', {timeout: 30000});
      await expect(page.locator('#runButton')).toBeVisible({timeout: 30000});
      // Wait for any loading overlay to clear.
      const overlay = page.locator('#overlay');
      await overlay.waitFor({state: 'hidden', timeout: 10000}).catch(() => {});
      // Rename the project via the header input.
      const nameEl = page.locator('.project_name');
      if (await nameEl.isVisible({timeout: 3000}).catch(() => false)) {
        await nameEl.click({timeout: 5000}).catch(() => {});
        const input = page.locator('.project_name input, input.project_name');
        if (await input.isVisible({timeout: 2000}).catch(() => false)) {
          await input.fill(
            lab === 'artist'
              ? 'My Drawing'
              : lab === 'spritelab'
                ? 'Pet Animation'
                : 'Dance Remix',
          );
          await input.press('Enter');
          await page.waitForTimeout(500);
        }
      }
    }

    await page.goto('/projects');
    await expect(page.locator('#uitest-personal-projects')).toBeVisible({
      timeout: 15000,
    });

    // Viewport orientation image.
    await docsScreenshot(
      page,
      'guide/projects/managing-your-projects.md',
      'projects-page',
    );

    // Crop: gallery switcher (My Projects / My Libraries / Featured Projects).
    const gallerySwitcher = page.locator('#uitest-gallery-switcher');
    if (await gallerySwitcher.isVisible({timeout: 5000}).catch(() => false)) {
      await docsScreenshot(
        page,
        'guide/projects/managing-your-projects.md',
        'gallery-filters',
        {locator: gallerySwitcher},
      );
    }

    // Crop: "Create a new project" section with lab cards.
    const createSection = page
      .locator('text=Create a new project')
      .locator('..');
    if (await createSection.isVisible({timeout: 3000}).catch(() => false)) {
      // Scroll to the section to ensure it is in view.
      await createSection.scrollIntoViewIfNeeded();
      await docsScreenshot(
        page,
        'guide/projects/managing-your-projects.md',
        'new-project',
        {locator: createSection},
      );
    }

    // Crop: project card actions menu (three-dot button opens a dropdown).
    // Scroll back up to the projects table.
    await page.locator('#uitest-personal-projects').scrollIntoViewIfNeeded();
    // The Quick Actions column has a button with a vertical ellipsis icon.
    const quickActionsBtn = page
      .locator('#uitest-personal-projects button')
      .filter({has: page.locator('svg, i, [class*="icon"]')})
      .first();
    if (await quickActionsBtn.isVisible({timeout: 5000}).catch(() => false)) {
      await quickActionsBtn.click();
      await page.waitForTimeout(500);
      // The dropdown list appears as a sibling or child element.
      const dropdownList = page
        .locator('ul')
        .filter({has: page.locator('button')})
        .last();
      if (await dropdownList.isVisible({timeout: 3000}).catch(() => false)) {
        await docsScreenshot(
          page,
          'guide/projects/managing-your-projects.md',
          'project-actions-menu',
          {locator: dropdownList},
        );
      }
    }
  });

  test('share dialog crop', async ({page}) => {
    await page.goto('/');
    await createStudent(page, {name: 'ShareStudent', age: '16'});
    await page.goto('/projects/dance/new');
    await page.waitForURL('**/edit', {timeout: 30000});
    await expect(page.locator('#runButton')).toBeVisible({timeout: 30000});

    await page.locator('.project_share').click({timeout: 15000});
    await expect(page.locator('#project-share')).toBeVisible({timeout: 10000});

    await docsScreenshot(
      page,
      'guide/projects/sharing-and-publishing.md',
      'share-dialog',
      {locator: page.locator('#project-share')},
    );
  });

  test('remix button crop', async ({page}) => {
    await page.goto('/');
    await createStudent(page, {name: 'RemixStudent', age: '16'});
    await page.goto('/projects/artist/new');
    await page.waitForURL('**/edit', {timeout: 30000});
    await expect(page.locator('#runButton')).toBeVisible({timeout: 30000});
    await expect(page.locator('.project_remix')).toBeVisible({timeout: 15000});

    await docsScreenshot(
      page,
      'guide/projects/sharing-and-publishing.md',
      'remix-button',
      {locator: page.locator('.project_remix')},
    );
  });

  test('under-13 student age-gated redirect', async ({page}) => {
    await page.goto('/');
    await createStudent(page, {name: 'YoungStudent', age: '10'});
    await page.goto('/projects/applab/new');
    await page.waitForTimeout(3000);
    // Under-13 should not reach the edit page.
    const url = page.url();
    expect(url).not.toContain('/edit');
  });

  test('public gallery loads', async ({page}) => {
    await page.goto('/projects/public');
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/projects\/public/);
    // No screenshot -- gallery page is not visually ambiguous.
  });

  test('teacher sees student projects tab', async ({page}) => {
    await page.goto('/');
    await createUser(page, {type: 'teacher', name: 'ProjectTeacher'});

    const section = await requestWithCsrf(
      page,
      'POST',
      '/dashboardapi/sections',
      {
        login_type: 'email',
        participant_type: 'student',
      },
    );
    expect(section.ok).toBe(true);
    const {id: sectionId} = JSON.parse(section.body);

    await page.goto(`/teacher_dashboard/sections/${sectionId}/projects`);
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/projects/);
  });
});
