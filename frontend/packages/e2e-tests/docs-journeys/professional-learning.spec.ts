import {expect, test} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createUser, resetSession} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

const BASE = 'http://localhost-studio.code.org:3000';

test.describe('Professional learning documentation journey', () => {
  test('Teacher visits PL landing, self-paced catalog, and workshop catalog', async ({
    page,
  }) => {
    await resetSession(page);
    await page.goto(BASE);
    await createUser(page, {type: 'teacher', name: 'PL Journey Teacher'});

    // PL landing page
    await page.goto(`${BASE}/my-professional-learning`);
    await expect(page.locator('h1')).toContainText('Professional Learning');

    // Self-paced course catalog
    await page.goto(`${BASE}/professional-learning/courses`);
    await expect(page.locator('h1')).toContainText(
      'Explore self-paced professional learning',
    );

    // Workshop catalog
    await page.goto(`${BASE}/professional-learning/workshops`);
    await expect(page.locator('h1')).toContainText(
      'Find CodeAI workshops near you',
    );

    // Contact regional partner
    await page.goto(`${BASE}/professional-learning/contact-regional-partner`);
    await expect(page.locator('h1')).toContainText(
      'Contact your local Regional Partner',
    );
  });

  test('Workshop admin visits workshop dashboard', async ({page}) => {
    await resetSession(page);
    await page.goto(BASE);
    await createUser(page, {type: 'teacher', name: 'WorkshopAdmin'});

    // Grant workshop_admin permission via the test API.
    const grantResp = await requestWithCsrf(
      page,
      'POST',
      '/api/test/workshop_admin_access',
    );
    expect(grantResp.ok).toBe(true);

    // Navigate to the workshop dashboard.
    await page.goto(`${BASE}/pd/workshop_dashboard`);
    await expect(
      page.getByRole('heading', {name: 'Your Workshops'}),
    ).toBeVisible({timeout: 20_000});

    // Viewport orientation image.
    await docsScreenshot(
      page,
      'guide/professional-learning/manage-workshops.md',
      'workshop-dashboard',
    );

    // PL landing for workshop_admin shows "Extra Links" rather than role tabs
    // (Facilitator Center, Workshop Organizer, etc.). Those tabs appear only
    // for facilitator or workshop_organizer roles. Crop skipped.
  });
});
