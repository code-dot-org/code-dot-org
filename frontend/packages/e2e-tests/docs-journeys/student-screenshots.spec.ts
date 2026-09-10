import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createStudent, createUser} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

test('sign-in page crops', async ({page}) => {
  await page.goto('/users/sign_in');
  await expect(page.locator('#section_code')).toBeVisible({timeout: 10000});

  // Crop: section code input and its surrounding label.
  const sectionCodeArea = page.locator('#section_code').locator('..');
  await docsScreenshot(
    page,
    'guide/getting-started/sign-in.md',
    'section-code-field',
    {locator: sectionCodeArea},
  );

  // Provider buttons (Google, Microsoft, etc.) are large, colorful, and labeled --
  // the text "Continue with Google" is sufficient for readers to find them.
  // A crop here includes a dev-only OAuth warning that is not in production.
});

test.describe('account settings screenshots', () => {
  test('settings page orientation and section crops', async ({page}) => {
    await page.goto('/');
    await createStudent(page, {name: 'SettingsStudent', age: '16'});
    await page.goto('/users/edit');
    await expect(page.locator('#account-information')).toBeVisible({
      timeout: 15000,
    });

    // Viewport orientation image.
    await docsScreenshot(
      page,
      'guide/getting-started/account-settings.md',
      'settings-page',
    );

    // Crop: account information form (display name, email, password).
    await docsScreenshot(
      page,
      'guide/getting-started/account-settings.md',
      'account-information',
      {locator: page.locator('#account-information')},
    );

    // Crop: linked accounts / sign-in methods.
    const linkedAccounts = page.locator('#manage-linked-accounts');
    if (await linkedAccounts.isVisible({timeout: 3000}).catch(() => false)) {
      await docsScreenshot(
        page,
        'guide/getting-started/account-settings.md',
        'sign-in-methods',
        {locator: linkedAccounts},
      );
    }

    // Crop: account type section.
    const changeUserType = page.locator('#change-user-type');
    if (await changeUserType.isVisible({timeout: 3000}).catch(() => false)) {
      await docsScreenshot(
        page,
        'guide/getting-started/account-settings.md',
        'account-type',
        {locator: changeUserType},
      );
    }

    // Crop: delete account section.
    const deleteAccount = page.locator('#delete-account');
    if (await deleteAccount.isVisible({timeout: 3000}).catch(() => false)) {
      await docsScreenshot(
        page,
        'guide/getting-started/account-settings.md',
        'delete-account',
        {locator: deleteAccount},
      );
    }
  });
});

test.describe('student progress screenshots', () => {
  test('progress view orientation and status indicators', async ({page}) => {
    // Teacher creates a section and assigns a course.
    await page.goto('/');
    await createUser(page, {
      type: 'teacher',
      name: 'ProgressImgTeacher',
    });

    const sectionResp = await requestWithCsrf(
      page,
      'POST',
      '/dashboardapi/sections',
      {login_type: 'email', participant_type: 'student'},
    );
    expect(sectionResp.ok).toBe(true);
    const section = JSON.parse(sectionResp.body) as {
      code: string;
      id: number;
    };

    // Find an assignable course.
    const qaResp = await page.evaluate(async () => {
      const r = await fetch(
        '/course_offerings/quick_assign_course_offerings?participantType=student',
      );
      return {ok: r.ok, status: r.status, body: await r.text()};
    });

    if (!qaResp.ok) {
      test.skip(true, `quick_assign returned ${qaResp.status}`);
      return;
    }

    let assignCourseVersionId: number | undefined;
    try {
      const offerings = JSON.parse(qaResp.body);
      outer: for (const gradeGroup of Object.values(offerings)) {
        for (const typeGroup of Object.values(gradeGroup)) {
          for (const offeringName of Object.keys(typeGroup)) {
            const coList = typeGroup[offeringName];
            for (const co of coList) {
              if (co.course_versions) {
                for (const cvEntry of co.course_versions) {
                  const cv = Array.isArray(cvEntry) ? cvEntry[1] : cvEntry;
                  if (cv?.id) {
                    assignCourseVersionId = cv.id;
                    break outer;
                  }
                }
              }
            }
          }
        }
      }
    } catch {
      // parse failed
    }

    if (!assignCourseVersionId) {
      test.skip(true, 'No assignable course found');
      return;
    }

    const patchResp = await requestWithCsrf(
      page,
      'PATCH',
      `/dashboardapi/sections/${section.id}`,
      {course_version_id: assignCourseVersionId},
    );
    expect(patchResp.ok).toBe(true);

    // Student joins the section.
    await createStudent(page, {name: 'ProgressImgKid', age: '14'});
    await page.goto('/');
    const joinResp = await requestWithCsrf(
      page,
      'POST',
      `/api/v1/sections/${section.code}/join`,
    );
    expect(joinResp.ok).toBe(true);

    // Navigate to home and click "View course" to reach the progress view.
    await page.goto('/home');
    await page.waitForLoadState('domcontentloaded');

    const viewCourseBtn = page.getByRole('link', {name: 'View course'}).first();
    await expect(viewCourseBtn).toBeVisible({timeout: 15000});
    await viewCourseBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // NOTE: Completing levels programmatically for mixed progress states is
    // BLOCKED -- CSF concept/video levels do not expose appOptions or Run buttons
    // usable for milestone POSTs. The status legend at the bottom of the page
    // demonstrates all circle states (filled, partial, empty).

    // Viewport orientation image of the progress view.
    await docsScreenshot(
      page,
      'guide/progress/your-progress.md',
      'progress-view',
    );

    // Crop: progress bubbles (status indicators).
    const bubbleSet = page
      .locator(
        '[class*="ProgressBubbleSet"], [class*="progress-bubble"], [class*="uitest-summary-progress"], [class*="SummaryProgressRow"]',
      )
      .first();
    if (await bubbleSet.isVisible({timeout: 5000}).catch(() => false)) {
      await docsScreenshot(
        page,
        'guide/progress/your-progress.md',
        'status-indicators',
        {locator: bubbleSet},
      );
    }
  });
});
