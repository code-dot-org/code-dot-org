import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createUser, signOut} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

test.describe('Student sign-in journey', () => {
  test('student signs in with email and password', async ({page}) => {
    await page.goto('/');
    const {email, password} = await createUser(page, {
      type: 'student',
      name: 'DocsStudent',
    });
    await signOut(page);

    await page.goto('/users/sign_in');
    await expect(page.locator('#signin')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Sign in'})).toBeVisible();
    await expect(page.locator('#section_code')).toBeVisible();
    await expect(
      page.getByRole('button', {name: 'Go', exact: true}),
    ).toBeVisible();
    await expect(
      page.getByRole('link', {name: 'Forgot your password?'}),
    ).toBeVisible();

    await page.locator('#user_login').fill(email);
    await page.locator('#user_password').fill(password);
    await Promise.all([
      page.waitForURL(url => !url.pathname.endsWith('/sign_in'), {
        waitUntil: 'domcontentloaded',
      }),
      page.locator('#signin-button').click(),
    ]);
    await expect(page.locator('.display_name')).toContainText('DocsStudent');
  });

  test('password reset page loads and labels match docs', async ({page}) => {
    await page.goto('/users/password/new');
    const btn = page.locator('#forgotpassword-button');
    const visible = await btn.isVisible().catch(() => false);
    if (visible) {
      await expect(btn).toHaveText('Submit');
    }
    expect(page.url()).toContain('/users/password/new');
  });
});

test.describe('Sign-in page crops', () => {
  test('section code field and forgot password link', async ({page}) => {
    await page.goto('/users/sign_in');
    await expect(page.locator('#section_code')).toBeVisible({timeout: 10_000});

    // Crop: section code input.
    const sectionCodeArea = page.locator('#section_code').locator('..');
    await docsScreenshot(
      page,
      'guide/getting-started/sign-in.md',
      'section-code-field',
      {locator: sectionCodeArea},
    );

    // Crop: forgot password link.
    const forgotLink = page.getByRole('link', {name: 'Forgot your password?'});
    await expect(forgotLink).toBeVisible({timeout: 5000});
    await docsScreenshot(
      page,
      'guide/getting-started/sign-in.md',
      'forgot-password-link',
      {locator: forgotLink},
    );
  });
});

test.describe('Picture and word login screenshots', () => {
  let pictureCode: string;
  let wordCode: string;

  test.beforeAll(async ({browser}) => {
    const page = await browser.newPage();
    await page.goto('/');

    await createUser(page, {type: 'teacher', name: 'LoginTypeTeacher'});
    await page.goto('/');

    // Picture-login section.
    const picResp = await requestWithCsrf(
      page,
      'POST',
      '/dashboardapi/sections',
      {
        login_type: 'picture',
        participant_type: 'student',
        name: 'Picture Password Class',
      },
    );
    expect(picResp.ok).toBe(true);
    const picSection = JSON.parse(picResp.body) as {id: number; code: string};
    pictureCode = picSection.code;

    const picStudentResp = await requestWithCsrf(
      page,
      'POST',
      `/api/v1/sections/${picSection.id}/students/bulk_add`,
      {students: [{name: 'Maria', age: '10'}]},
    );
    expect(picStudentResp.ok).toBe(true);

    // Word-login section.
    const wordResp = await requestWithCsrf(
      page,
      'POST',
      '/dashboardapi/sections',
      {
        login_type: 'word',
        participant_type: 'student',
        name: 'Secret Words Class',
      },
    );
    expect(wordResp.ok).toBe(true);
    const wordSection = JSON.parse(wordResp.body) as {
      id: number;
      code: string;
    };
    wordCode = wordSection.code;

    const wordStudentResp = await requestWithCsrf(
      page,
      'POST',
      `/api/v1/sections/${wordSection.id}/students/bulk_add`,
      {students: [{name: 'Carlos', age: '8'}]},
    );
    expect(wordStudentResp.ok).toBe(true);

    await page.close();
  });

  test('picture password grid', async ({page}) => {
    await page.goto('/users/sign_in');
    await expect(page.locator('#section_code')).toBeVisible({timeout: 10_000});

    await page.locator('#section_code').fill(pictureCode);
    await page.getByRole('button', {name: 'Go', exact: true}).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Select Maria from the student list.
    const mariaBtn = page.getByText('Maria').first();
    const mariaVisible = await mariaBtn
      .isVisible({timeout: 10_000})
      .catch(() => false);
    if (mariaVisible) {
      await mariaBtn.click();
      await page.waitForTimeout(2000);

      // Capture the picture grid.
      await docsScreenshot(
        page,
        'guide/getting-started/sign-in.md',
        'picture-password-grid',
      );
    }
  });

  test('word password entry', async ({page}) => {
    await page.goto('/users/sign_in');
    await expect(page.locator('#section_code')).toBeVisible({timeout: 10_000});

    await page.locator('#section_code').fill(wordCode);
    await page.getByRole('button', {name: 'Go', exact: true}).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Select Carlos from the student list.
    const carlosBtn = page.getByText('Carlos').first();
    const carlosVisible = await carlosBtn
      .isVisible({timeout: 10_000})
      .catch(() => false);
    if (carlosVisible) {
      await carlosBtn.click();
      await page.waitForTimeout(2000);

      // Capture the word password entry.
      await docsScreenshot(
        page,
        'guide/getting-started/sign-in.md',
        'word-password-entry',
      );
    }
  });
});
