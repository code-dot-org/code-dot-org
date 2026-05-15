import {type Page} from '@playwright/test';

interface CurrentUserResponse {
  id: number;
}

interface PdWorkshopResponse {
  id: number;
  sessions: Array<{id: number}>;
}

interface PdEnrollmentCreateResponse {
  workshop_enrollment_status: string;
  cancel_url?: string;
}

interface PdEnrollmentResponse {
  id: number;
  user_id: number;
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
  const response = await page.request.get('/api/v1/users/current');
  if (!response.ok()) {
    throw new Error(
      `current user lookup failed: ${response.status()} - ${await response.text()}`,
    );
  }
  const currentUser = (await response.json()) as CurrentUserResponse;
  return currentUser.id;
}

/**
 * Returns the CSRF token from the current page.
 *
 * @param page - Playwright page holding the signed-in session
 */
async function getCsrfToken(page: Page): Promise<string> {
  return (
    (await page.locator('meta[name="csrf-token"]').getAttribute('content')) ??
    ''
  );
}

/**
 * Adds complete US school info to the current user.
 *
 * This mirrors the school-info record that the Cucumber PD factory attaches
 * before workshop enrollment. The visible enrollment page then reaches the
 * closed/full/duplicate status instead of prompting for missing profile data.
 *
 * @param page - Playwright page holding the signed-in teacher session
 */
export async function addCurrentUserSchoolInfo(page: Page): Promise<void> {
  const response = await page.request.patch('/api/v1/user_school_infos', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getCsrfToken(page),
    },
    data: {
      user: {
        school_info_attributes: {
          country: 'US',
          school_type: 'other',
          school_name: 'Code.org',
          zip: '98101',
        },
      },
    },
  });
  if (!response.ok()) {
    throw new Error(
      `school info update failed: ${response.status()} - ${await response.text()}`,
    );
  }
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
  const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  start.setUTCHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  const response = await page.request.post('/api/v1/pd/workshops', {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getCsrfToken(page),
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
 * Enrolls the current teacher in a workshop and returns the enrollment code.
 *
 * @param page - Playwright page holding the signed-in teacher session
 * @param workshopId - workshop id
 */
export async function enrollCurrentUserInWorkshop(
  page: Page,
  workshopId: number,
): Promise<string> {
  const userId = await getCurrentUserId(page);
  const response = await page.request.post(
    `/api/v1/pd/workshops/${workshopId}/enrollments`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getCsrfToken(page),
      },
      data: {user_id: userId},
    },
  );
  if (!response.ok()) {
    throw new Error(
      `workshop enrollment failed: ${response.status()} - ${await response.text()}`,
    );
  }

  const enrollment = (await response.json()) as PdEnrollmentCreateResponse;
  const code = enrollment.cancel_url?.match(
    /\/pd\/workshop_enrollment\/([^/]+)\/cancel/,
  )?.[1];
  if (enrollment.workshop_enrollment_status !== 'success' || !code) {
    throw new Error(
      `unexpected enrollment response: ${JSON.stringify(enrollment)}`,
    );
  }

  return code;
}

/**
 * Marks the current teacher attended for the first workshop session.
 *
 * @param page - Playwright page holding the signed-in teacher session
 * @param workshopId - workshop id
 */
export async function markCurrentUserAttended(
  page: Page,
  workshopId: number,
): Promise<void> {
  const [userId, workshopResponse, enrollmentsResponse] = await Promise.all([
    getCurrentUserId(page),
    page.request.get(`/api/v1/pd/workshops/${workshopId}`),
    page.request.get(`/api/v1/pd/workshops/${workshopId}/enrollments`),
  ]);
  if (!workshopResponse.ok()) {
    throw new Error(
      `workshop lookup failed: ${workshopResponse.status()} - ${await workshopResponse.text()}`,
    );
  }
  if (!enrollmentsResponse.ok()) {
    throw new Error(
      `workshop enrollments lookup failed: ${enrollmentsResponse.status()} - ${await enrollmentsResponse.text()}`,
    );
  }

  const workshop = (await workshopResponse.json()) as PdWorkshopResponse;
  const sessionId = workshop.sessions[0]?.id;
  if (!sessionId) {
    throw new Error(`workshop ${workshopId} has no sessions`);
  }

  const enrollments =
    (await enrollmentsResponse.json()) as PdEnrollmentResponse[];
  const enrollment = enrollments.find(item => item.user_id === userId);
  if (!enrollment) {
    throw new Error(
      `current user has no enrollment for workshop ${workshopId}`,
    );
  }

  const response = await page.request.put(
    `/api/v1/pd/workshops/${workshopId}/attendance/${sessionId}/user/${userId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getCsrfToken(page),
      },
    },
  );
  if (!response.ok()) {
    throw new Error(
      `mark attendance failed: ${response.status()} - ${await response.text()}`,
    );
  }
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
  const response = await page.request.post(
    `/api/v1/pd/workshops/${workshopId}/end`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getCsrfToken(page),
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
  const response = await page.request.post(
    `/api/v1/pd/workshops/${workshopId}/start`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getCsrfToken(page),
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
  const response = await page.request.delete(
    `/api/v1/pd/workshops/${workshopId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getCsrfToken(page),
      },
    },
  );
  if (!response.ok() && response.status() !== 404) {
    throw new Error(
      `delete workshop failed: ${response.status()} - ${await response.text()}`,
    );
  }
}
