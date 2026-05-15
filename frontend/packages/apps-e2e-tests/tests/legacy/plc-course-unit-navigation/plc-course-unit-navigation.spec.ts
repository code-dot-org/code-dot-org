import {type Page} from '@playwright/test';

import {createTeacher, grantFacilitatorAccess} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

const MODULE_PROGRESS_COLORS = {
  not_started: 'rgb(255, 255, 255)',
  in_progress: 'rgb(239, 205, 28)',
  completed: 'rgb(14, 190, 14)',
} as const;

/**
 * POSTs a test-only PLC helper endpoint for the signed-in teacher.
 *
 * @param page - current teacher page
 * @param endpoint - endpoint under /api/test
 */
async function postTestEndpoint(page: Page, endpoint: string): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  if (!csrf) {
    throw new Error(`Missing CSRF token before POST /api/test/${endpoint}`);
  }
  const response = await page.request.post(`/api/test/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
    },
  });
  if (!response.ok()) {
    throw new Error(
      `${endpoint} failed: ${response.status()} - ${await response.text()}`,
    );
  }
}

/**
 * Asserts the visible PLC ribbon color. This mirrors the Cucumber progress
 * helper, which checks `background-color` rather than class names.
 *
 * @param page - current PLC course page
 * @param index - zero-based module assignment index
 * @param status - expected module progress status
 */
async function expectRibbonProgress(
  page: Page,
  index: number,
  status: keyof typeof MODULE_PROGRESS_COLORS,
): Promise<void> {
  await expect(
    page.locator('.course_unit_section .ribbon').nth(index),
  ).toHaveCSS('background-color', MODULE_PROGRESS_COLORS[status], {
    timeout: 30_000,
  });
}

test.describe('PLC course unit navigation', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/plc_course_unit_navigation.feature
   * Scenario: Basic navigation and ribbon changing works as expected
   */
  test('course unit ribbons update after PLC assessment completion', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Test Deeper Learning Participant'});
    await grantFacilitatorAccess(page);
    await postTestEndpoint(page, 'enroll_in_plc_course');

    await page.goto('/courses/All%20The%20PLC%20Things');
    const unitTitle = page.locator('a.course_unit_title');
    const moduleLinks = page.locator('.course_unit_section a', {
      has: page.locator('.ribbon'),
    });
    await expect(unitTitle).toBeVisible({timeout: 30_000});
    await expectRibbonProgress(page, 0, 'not_started');
    await expectRibbonProgress(page, 1, 'not_started');
    await expectRibbonProgress(page, 2, 'not_started');
    await expectRibbonProgress(page, 3, 'not_started');

    await unitTitle.click();
    await expect(page.locator('.uitest-plcbreadcrumb')).toBeVisible({
      timeout: 30_000,
    });
    await postTestEndpoint(page, 'fake_completion_assessment');

    await page.locator('.uitest-plcbreadcrumb a').click();
    await expect(page.locator('.course_unit_section')).toBeVisible({
      timeout: 30_000,
    });
    await expectRibbonProgress(page, 1, 'completed');

    await moduleLinks.nth(3).click();
    await expect(page).toHaveURL(/\/s\/alltheplcthings/, {timeout: 30_000});
    await page.goto('/s/alltheplcthings/lessons/11/levels/6');
    await expect(page.locator('.submitButton')).toBeVisible({timeout: 30_000});
    await page.locator('textarea').fill('Test Answer');
    await page.locator('.submitButton').click();
    await expect(page).toHaveURL(/\/lessons\/11\/levels\/7/, {
      timeout: 30_000,
    });

    await page.goto('/courses/All%20The%20PLC%20Things');
    await expect(page.locator('.course_unit_section')).toBeVisible({
      timeout: 30_000,
    });
    await expectRibbonProgress(page, 2, 'in_progress');
  });
});
