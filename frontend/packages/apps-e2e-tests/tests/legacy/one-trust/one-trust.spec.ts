import {type Page} from '@playwright/test';

import {createStudent} from '../../shared/auth';
import {mockDcdo, mockGeolocation} from '../../shared/cookies';
import {expect, test} from '../../shared/fixtures';

/**
 * OneTrust integration — script loading and popup behaviour.
 *
 * Source:
 *   dashboard/test/ui/features/platform/one_trust.feature
 *
 * Skipped scenario:
 *   - @eyes screenshot scenario (visual-diff lane only)
 */

/**
 * Asserts that every element matching `selector` lacks an OneTrust category
 * class (optanon-category-*).  Mirrors the "is not categorized by OneTrust"
 * step definition in steps.rb: if no elements match, the assertion passes
 * vacuously.
 *
 * @param page - Playwright page
 * @param selector - CSS selector for script elements to inspect
 */
async function assertNotCategorizedByOneTrust(
  page: Page,
  selector: string,
): Promise<void> {
  const elements = await page.locator(selector).all();
  for (const el of elements) {
    const cls = (await el.getAttribute('class')) ?? '';
    expect(cls).not.toContain('optanon-category-');
  }
}

// ─── OneTrust popup ───────────────────────────────────────────────────────────

test(
  'OneTrust cookie pop-up shows for European users',
  {tag: '@no_mobile'},
  async ({page}) => {
    await createStudent(page);
    // otreset=true instructs the OneTrust SDK to clear consent and update the
    // URL to otreset=false; otgeo=es mocks geolocation as Spain (GDPR region).
    await page.goto('/home?otreset=true&otgeo=es');
    await expect(page).toHaveURL(/otreset=false/, {timeout: 30_000});
    await expect(page.locator('#onetrust-banner-sdk')).toBeVisible({
      timeout: 30_000,
    });
  },
);

// ─── Script loading — self-hosted (default) ───────────────────────────────────

test(
  'dashboard pages load the self-hosted OneTrust libraries',
  {tag: '@no_mobile'},
  async ({page}) => {
    await page.goto('/users/sign_in');
    await expect(
      page.locator("script[src$='onetrust/cdo/scripttemplates/otSDKStub.js']"),
    ).not.toHaveCount(0);
    await expect(
      page.locator("script[src$='977d/OtAutoBlock.js']"),
    ).not.toHaveCount(0);
    await expect(
      page.locator("script[src$='977d-test/OtAutoBlock.js']"),
    ).toHaveCount(0);
  },
);

// ─── Script loading — prod libraries via DCDO mock ───────────────────────────

test(
  'dashboard pages load the OneTrust prod libraries when DCDO=prod',
  {tag: '@no_mobile'},
  async ({page}) => {
    await page.goto('/users/sign_in');
    await mockDcdo(page, 'onetrust_cookie_scripts', 'prod');
    await page.goto('/users/sign_in');
    await expect(page.locator("script[src$='otSDKStub.js']")).not.toHaveCount(
      0,
    );
    await expect(
      page.locator("script[src$='977d/OtAutoBlock.js']"),
    ).not.toHaveCount(0);
    await expect(
      page.locator("script[src$='977d-test/OtAutoBlock.js']"),
    ).toHaveCount(0);
    await expect(
      page.locator("script[src$='onetrust/scripttemplates/otSDKStub.js']"),
    ).toHaveCount(0);
  },
);

// ─── Script loading — test libraries via query param ─────────────────────────

test(
  'dashboard pages load the test OneTrust libraries when ?onetrust_cookie_scripts=test',
  {tag: '@no_mobile'},
  async ({page}) => {
    await page.goto('/users/sign_in?onetrust_cookie_scripts=test');
    await expect(page.locator("script[src$='otSDKStub.js']")).not.toHaveCount(
      0,
    );
    await expect(
      page.locator("script[src$='977d/OtAutoBlock.js']"),
    ).toHaveCount(0);
    await expect(
      page.locator("script[src$='977d-test/OtAutoBlock.js']"),
    ).not.toHaveCount(0);
  },
);

// ─── Script loading — disabled via query param ───────────────────────────────

test(
  'dashboard pages do not load OneTrust libraries when ?onetrust_cookie_scripts=off',
  {tag: '@no_mobile'},
  async ({page}) => {
    await page.goto('/users/sign_in?onetrust_cookie_scripts=off');
    await expect(page.locator("script[src$='otSDKStub.js']")).toHaveCount(0);
    await expect(
      page.locator("script[src$='977d/OtAutoBlock.js']"),
    ).toHaveCount(0);
    await expect(
      page.locator("script[src$='977d-test/OtAutoBlock.js']"),
    ).toHaveCount(0);
  },
);

// ─── Critical JS files are not categorized by OneTrust ───────────────────────

test(
  'critical JS bundles on sign-in page are not categorized by OneTrust',
  {tag: '@no_mobile'},
  async ({page}) => {
    await page.goto('/users/sign_in');
    await assertNotCategorizedByOneTrust(
      page,
      "script[src*='/assets/application']",
    );
    await assertNotCategorizedByOneTrust(
      page,
      "script[src*='js/webpack-runtime']",
    );
    await assertNotCategorizedByOneTrust(page, "script[src*='js/essential']");
    await assertNotCategorizedByOneTrust(page, "script[src*='js/vendors']");
    await assertNotCategorizedByOneTrust(page, "script[src*='/common_locale']");
    await assertNotCategorizedByOneTrust(
      page,
      "script[src*='js/code-studio-common']",
    );
    await assertNotCategorizedByOneTrust(page, "script[src*='js/code-studio']");
  },
);

// ─── Embedded projects do not display the OneTrust banner ────────────────────

const EMBEDDED_PROJECT_URLS = [
  '/projects/music/new',
  '/projects/spritelab/new',
  '/projects/artist/new',
  '/projects/gamelab/new',
  '/projects/dance/new',
  '/projects/applab/new',
  '/projects/poetry/new',
  '/projects/flappy/new',
  '/projects/frozen/new',
] as const;

test.describe('Embedded projects — OneTrust banner suppressed', () => {
  for (const projectUrl of EMBEDDED_PROJECT_URLS) {
    test(
      `${projectUrl} embed does not load OneTrust`,
      {tag: '@no_mobile'},
      async ({page}) => {
        await createStudent(page);
        // Spoof geolocation as Spain (GDPR region) to maximise chance of
        // OneTrust firing; the test asserts it is suppressed in embed.
        await mockGeolocation(page, '150.214.39.255');

        // Navigate to the project; the server redirects /new → /<id>/edit.
        await page.goto(projectUrl);
        await page.waitForURL(/\/edit/, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });

        // Switch to the embedded view with otreset+otgeo — mirrors
        // `I switch to the embedded view of current project with query "..."`.
        const embedUrl =
          page.url().replace('/edit', '/embed') + '?otreset=true&otgeo=es';
        await page.goto(embedUrl, {waitUntil: 'domcontentloaded'});

        await expect(page.locator("script[src$='otSDKStub.js']")).toHaveCount(
          0,
        );
        await expect(page.locator("script[src$='OtAutoBlock.js']")).toHaveCount(
          0,
        );
      },
    );
  }
});
