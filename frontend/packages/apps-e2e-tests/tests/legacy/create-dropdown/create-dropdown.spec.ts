import {createTeacher, createStudent, createSection} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Create Dropdown in the dashboard header — visibility and link sets.
 *
 * Source:
 *   dashboard/test/ui/features/foundations/create_dropdown.feature
 *
 * Tagged @no_mobile. @single_session tag is irrelevant in Playwright (each test
 * is isolated); scenarios do not share state across tests.
 */

test.describe('Create dropdown in header', () => {
  test(
    'create_menu does not show on level pages',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page);
      await page.goto(
        '/courses/allthethingscourse/units/1/lessons/18/levels/7?noautoplay=true',
      );
      await page
        .locator('#runButton, .uitest-lab-container')
        .first()
        .waitFor({state: 'visible', timeout: 30_000});

      await expect(page.locator('.create_menu')).not.toBeVisible();
    },
  );

  test(
    'teacher: create dropdown shows expected project types',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page);
      await page.goto('/home');
      await page
        .locator('.create_menu')
        .waitFor({state: 'visible', timeout: 30_000});

      await page.locator('.create_menu').click();
      await expect(page.locator('#create_dropdown_spritelab')).toBeVisible();
      await expect(page.locator('#create_dropdown_artist')).toBeVisible();
      await expect(page.locator('#create_dropdown_applab')).toBeVisible();
      await expect(page.locator('#create_dropdown_gamelab')).toBeVisible();
      await expect(
        page.locator('#create_dropdown_minecraft'),
      ).not.toBeVisible();
      await expect(page.locator('#create_dropdown_dance')).toBeVisible();
      await expect(page.locator('#view_all_projects')).toBeVisible();
    },
  );

  test(
    'student age 13+: create dropdown shows expected project types',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page, {age: 16});
      await page.goto('/home');
      await page
        .locator('.create_menu')
        .waitFor({state: 'visible', timeout: 30_000});

      await page.locator('.create_menu').click();
      await expect(page.locator('#create_dropdown_spritelab')).toBeVisible();
      await expect(page.locator('#create_dropdown_artist')).toBeVisible();
      await expect(page.locator('#create_dropdown_applab')).toBeVisible();
      await expect(page.locator('#create_dropdown_gamelab')).toBeVisible();
      await expect(
        page.locator('#create_dropdown_minecraft'),
      ).not.toBeVisible();
      await expect(page.locator('#create_dropdown_dance')).toBeVisible();
      await expect(page.locator('#view_all_projects')).toBeVisible();
    },
  );

  test(
    'young student not in section: restricted project types',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page, {age: 10});
      await page.goto('/home');
      await page
        .locator('.create_menu')
        .waitFor({state: 'visible', timeout: 30_000});

      await page.locator('.create_menu').click();
      await expect(page.locator('#create_dropdown_spritelab')).toBeVisible();
      await expect(page.locator('#create_dropdown_artist')).toBeVisible();
      await expect(page.locator('#create_dropdown_minecraft')).toBeVisible();
      await expect(page.locator('#create_dropdown_applab')).not.toBeVisible();
      await expect(page.locator('#create_dropdown_gamelab')).not.toBeVisible();
      await expect(page.locator('#create_dropdown_dance')).toBeVisible();
      await expect(page.locator('#view_all_projects')).toBeVisible();
    },
  );

  test(
    'young student in section: unlocked project types match teacher/13+ set',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Create teacher and section, then switch to young student and join.
      await createTeacher(page);
      const {sectionCode} = await createSection(page);

      // Switch to young student session.
      await createStudent(page, {age: 10});

      // Join the section via POST (same as createTeacherAssociatedStudent does).
      const csrf = await page
        .locator('meta[name="csrf-token"]')
        .getAttribute('content');
      const joinResp = await page.request.post(`/join/${sectionCode}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf ?? '',
        },
      });
      if (!joinResp.ok()) {
        throw new Error(
          `join section failed: ${joinResp.status()} — ${await joinResp.text()}`,
        );
      }

      await page.goto('/home');
      await page
        .locator('.create_menu')
        .waitFor({state: 'visible', timeout: 30_000});

      await page.locator('.create_menu').click();
      await expect(page.locator('#create_dropdown_spritelab')).toBeVisible();
      await expect(page.locator('#create_dropdown_artist')).toBeVisible();
      await expect(page.locator('#create_dropdown_applab')).toBeVisible();
      await expect(page.locator('#create_dropdown_gamelab')).toBeVisible();
      await expect(
        page.locator('#create_dropdown_minecraft'),
      ).not.toBeVisible();
      await expect(page.locator('#create_dropdown_dance')).toBeVisible();
      await expect(page.locator('#view_all_projects')).toBeVisible();
    },
  );
});
