import {type Page} from '@playwright/test';

interface CurrentUserResponse {
  id: number;
}

interface PdWorkshopResponse {
  id: number;
}

interface CreatePdWorkshopOptions {
  capacity?: number;
  name?: string;
  regionalPartnerId?: number;
}

/**
 * Returns the currently signed-in user's id.
 *
 * @param page - Playwright page holding the signed-in session
 */
export async function getCurrentUserId(page: Page): Promise<number> {
  const response = await page.request.get('/dashboardapi/users/current');
  if (!response.ok()) {
    throw new Error(
      `current user lookup failed: ${response.status()} - ${await response.text()}`,
    );
  }
  const currentUser = (await response.json()) as CurrentUserResponse;
  return currentUser.id;
}

/**
 * Creates a future CSP workshop via the public workshop API.
 *
 * The caller must hold workshop-admin or organizer permissions. The returned id
 * should be cleaned up with {@link deletePdWorkshop}.
 *
 * @param page - Playwright page holding the authorized session
 * @param options - optional workshop overrides
 */
export async function createPdWorkshop(
  page: Page,
  {
    capacity = 10,
    name = `PW Workshop ${Date.now()}`,
    regionalPartnerId,
  }: CreatePdWorkshopOptions = {},
): Promise<number> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  start.setUTCHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  const response = await page.request.post('/api/v1/pd/workshops', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf ?? '',
    },
    data: {
      pd_workshop: {
        location_address: 'Seattle, WA',
        course: 'CS Principles',
        subject: 'Academic Year Workshop 1',
        capacity,
        suppress_email: true,
        name,
        description: 'This is a Playwright-created workshop',
        grades: ['K', '1'],
        ...(regionalPartnerId ? {regional_partner_id: regionalPartnerId} : {}),
        sessions_attributes: [
          {
            start: start.toISOString(),
            end: end.toISOString(),
            session_format: 'in_person',
          },
        ],
      },
    },
  });
  if (!response.ok()) {
    throw new Error(
      `create workshop failed: ${response.status()} - ${await response.text()}`,
    );
  }
  const workshop = (await response.json()) as PdWorkshopResponse;
  return workshop.id;
}

/**
 * Marks a workshop ended.
 *
 * @param page - Playwright page holding the authorized session
 * @param workshopId - workshop id
 */
export async function endPdWorkshop(
  page: Page,
  workshopId: number,
): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const response = await page.request.post(
    `/api/v1/pd/workshops/${workshopId}/end`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
    },
  );
  if (!response.ok()) {
    throw new Error(
      `end workshop failed: ${response.status()} - ${await response.text()}`,
    );
  }
}

/**
 * Marks a workshop started.
 *
 * @param page - Playwright page holding the authorized session
 * @param workshopId - workshop id
 */
export async function startPdWorkshop(
  page: Page,
  workshopId: number,
): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const response = await page.request.post(
    `/api/v1/pd/workshops/${workshopId}/start`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
    },
  );
  if (!response.ok()) {
    throw new Error(
      `start workshop failed: ${response.status()} - ${await response.text()}`,
    );
  }
}

/**
 * Deletes a Playwright-created workshop if it still exists.
 *
 * @param page - Playwright page holding the authorized session
 * @param workshopId - workshop id
 */
export async function deletePdWorkshop(
  page: Page,
  workshopId: number,
): Promise<void> {
  const csrf = await page
    .locator('meta[name="csrf-token"]')
    .getAttribute('content');
  const response = await page.request.delete(
    `/api/v1/pd/workshops/${workshopId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf ?? '',
      },
    },
  );
  if (!response.ok() && response.status() !== 404) {
    throw new Error(
      `delete workshop failed: ${response.status()} - ${await response.text()}`,
    );
  }
}
