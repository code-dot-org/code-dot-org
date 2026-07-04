import {test, expect, type Page} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import {requestWithCsrf} from '../shared/api';
import {createUser, resetSession} from '../shared/auth';
import {captureRegion, compareRegions} from '../shared/visual-parity';

/**
 * Legacy baseline capture for teacher-dashboard-foundation F0-T9
 * (TDF-VIS-04..07). Capture-mode: each test seeds one deterministic
 * teacher/section, captures its route TWICE, and asserts the two captures
 * are pixel-identical (the harness's own regression signal — same pattern as
 * TDF-VIS-01 in visual-parity-selftest.spec.ts). The first capture is also
 * saved as the committed baseline PNG under __baselines__/.
 *
 * Legacy-vs-candidate comparison is OUT OF SCOPE here (visual-artifacts.md
 * "Candidate counterparts": no candidate routes exist until feature 1) — a
 * TODO for that feature, reusing these exact selectors/masks/params.
 */

const REGION_SELECTOR = '#teacher-dashboard';
const VIEWPORT = {width: 1280, height: 720};
const BASELINE_DIR = path.join(__dirname, '__baselines__');

// Pinned per visual-artifacts.md stabilization #5 ("pin one fixed timestamp
// for all baselines"); none of these four routes render a date for a
// no-progress section, but the clock is frozen regardless as a defensive
// stabilization lever.
const FIXED_TIME = '2024-01-01T12:00:00.000Z';

const SECTION_NAME = 'TD Baseline Section';
const STUDENT_NAMES = ['Ada Lovelace', 'Grace Hopper'] as const;

/**
 * The join-code copy button — per-run generated value. The same
 * JoinLinkCopyButton component (same id) renders on both home (section card)
 * and roster ("SECTION CODE:" header); the static label sits outside the
 * button, so masking the button masks exactly the per-run code text.
 * Applied on both routes (F0-T14).
 */
export const MASK_JOIN_CODE = '#ui-test-section-code-button';

/**
 * mask-join-code extension for body text (F0-T14): the roster sign-in
 * instructions embed the code twice more — a join-link <a> and a bare text
 * node ("enter the section code XXXXXX"), both inside one SafeMarkdown <li>.
 * The text node has no wrapping element, so the whole <li> is masked,
 * anchored on the per-run code value itself rather than on English phrasing.
 */
export const joinCodeBodyTextMask = (sectionCode: string): string =>
  `li:has-text("${sectionCode}")`;

/**
 * Home: the section avatar (emoji/color), scoped to this run's section id.
 * avatar_color/avatar_emoji are null on a freshly created section (render as
 * index 0, deterministically) but this route's table entry in
 * visual-artifacts.md calls for a mask regardless of current stability.
 */
export const sectionAvatarMask = (sectionId: number): string =>
  `[aria-labelledby="section-card-title-${sectionId}"] [role="img"]`;

/**
 * Roster: the "Show words" secret/password-column toggle, one per student
 * row. Collapsed by default (no cleartext secret rendered), but masked per
 * visual-artifacts.md's declared table entry for this route.
 */
export const MASK_STUDENT_PASSWORDS = '.uitest-show-picture-or-word';

/**
 * Roster: the "Username: coder_xxx" line under each student name — the
 * username carries a per-run random suffix (F0-T14). The CSS-module class is
 * the dev build's `[path][name]__[local]` localIdentName
 * (apps/webpack.config.js:292), stable under the permanent :9000 dev-build
 * capture convention; matched by substring so a path shuffle can't silently
 * unmask it.
 */
export const MASK_USERNAMES =
  '[class*="manageStudentsNameCell-module__details"]';

/**
 * Login info: the printable login cards, each containing a student's
 * server-generated secret words. Targets the card divs, not `#printArea`
 * itself: the container has zero height (floated children), so its own
 * bounding box covers nothing.
 */
export const MASK_SECRET_WORDS = '#printArea > div';

interface SeededSection {
  sectionId: number;
  sectionCode: string;
}

/**
 * DOCUMENTED DEVIATION (apply-log.md "F0-T9"): the capture-target ruling
 * requires the FRESH apps build (webpack devserver, :9000), but Rails
 * resolves every bundle URL through the prebuilt apps-package manifest
 * (lib/cdo/asset_helper.rb:35-42; CDO.use_my_apps unset), so the HTML
 * references stale hashed `.min.js` names that the devserver's catch-all
 * proxy (apps/webpack.config.js:819) passes back to the stale package —
 * whose teacher_dashboard bundle is broken (never mounts). The devserver
 * serves the fresh build at the SAME entry paths, unhashed. This rewrite
 * maps each manifest-hashed request to its fresh, unhashed equivalent:
 * same entries, same server, fresh code. Confirmed both necessary and
 * sufficient for the legacy app to mount.
 */
async function rewriteHashedAssetsToDevBuild(page: Page): Promise<void> {
  await page.route(/\/assets\/js\/.*wp[0-9a-f]{20}(\.min)?\.js$/, route => {
    const url = route
      .request()
      .url()
      .replace(/wp[0-9a-f]{20}(\.min)?\.js$/, '.js');
    return route.continue({url});
  });
}

/**
 * Navigates once, tolerating one retry on a 500 (apply-log.md "Environment
 * observation" — an intermittent session_store quirk on first touch).
 */
async function gotoTolerating500(page: Page, url: string): Promise<void> {
  const first = await page.goto(url, {waitUntil: 'domcontentloaded'});
  if (first?.status() !== 500) return;
  const retry = await page.goto(url, {waitUntil: 'domcontentloaded'});
  if (retry?.status() === 500) {
    throw new Error(`Persistent 500 loading ${url} after one retry`);
  }
}

/** The single-unit course/unit with the lowest course_version_id — a deterministic pick given a fixed DB state. */
async function findSingleUnitCourseVersion(
  page: Page,
): Promise<{courseVersionId: number; unitId: number}> {
  const {ok, status, body} = await requestWithCsrf(
    page,
    'GET',
    '/api/v1/sections/valid_course_offerings',
  );
  if (!ok) {
    throw new Error(`valid_course_offerings failed: ${status}`);
  }

  const offerings = JSON.parse(body) as Record<
    string,
    {
      course_versions: Record<
        string,
        {id: number; units: Record<string, {id: number}>}
      >;
    }
  >;

  const candidates: Array<{courseVersionId: number; unitId: number}> = [];
  for (const offering of Object.values(offerings)) {
    for (const courseVersion of Object.values(offering.course_versions)) {
      const unitIds = Object.values(courseVersion.units).map(unit => unit.id);
      if (unitIds.length === 1) {
        candidates.push({
          courseVersionId: courseVersion.id,
          unitId: unitIds[0],
        });
      }
    }
  }
  candidates.sort((a, b) => a.courseVersionId - b.courseVersionId);
  if (candidates.length === 0) {
    throw new Error(
      'No single-unit course offering available to seed a deterministic unit assignment',
    );
  }
  return candidates[0];
}

/**
 * Seeds one fresh teacher with one word-login section, 2 deterministically
 * named students, and an assigned unit — via the same dashboardapi/api/v1
 * sections surface `createTeacherAssociatedStudent` (tests/shared/auth.ts)
 * uses, extended with bulk_add (word/picture-only) and unit assignment.
 * Never navigates to `/` (known root 500 quirk) — reloads via
 * /teacher_dashboard/home instead, per createTeacherAssociatedStudent's
 * reload-for-fresh-CSRF pattern.
 */
async function seedTeacherWithSection(page: Page): Promise<SeededSection> {
  await rewriteHashedAssetsToDevBuild(page);
  await resetSession(page);
  await gotoTolerating500(page, '/users/sign_in');
  await createUser(page, {type: 'teacher', name: 'TD Baseline Teacher'});
  await gotoTolerating500(page, '/teacher_dashboard/home');

  const sectionRes = await requestWithCsrf(page, 'POST', '/api/v1/sections', {
    login_type: 'word',
    participant_type: 'student',
    name: SECTION_NAME,
  });
  if (!sectionRes.ok) {
    throw new Error(`section create failed: ${sectionRes.status}`);
  }
  const section = JSON.parse(sectionRes.body) as {id: number; code: string};

  const studentsRes = await requestWithCsrf(
    page,
    'POST',
    `/api/v1/sections/${section.id}/students/bulk_add`,
    {students: STUDENT_NAMES.map(name => ({name}))},
  );
  if (!studentsRes.ok) {
    throw new Error(`bulk_add failed: ${studentsRes.status}`);
  }

  const {courseVersionId, unitId} = await findSingleUnitCourseVersion(page);
  const assignRes = await requestWithCsrf(
    page,
    'PATCH',
    `/api/v1/sections/${section.id}`,
    {course_version_id: courseVersionId, unit_id: unitId},
  );
  if (!assignRes.ok) {
    throw new Error(`unit assignment failed: ${assignRes.status}`);
  }

  return {sectionId: section.id, sectionCode: section.code};
}

async function captureRouteTwiceAndSave(
  page: Page,
  filename: string,
  options: Parameters<typeof captureRegion>[1],
): Promise<void> {
  const first = await captureRegion(page, options);
  const second = await captureRegion(page, options);

  const {diffPixels, diffPng} = compareRegions(first, second);
  if (diffPixels !== 0) {
    // Failed determinism gate: write the diff + both captures as CI/M2
    // escalation artifacts (uncommitted; test-results/ is gitignored).
    const diffDir = path.join('test-results', 'teacher-dashboard-baselines');
    fs.mkdirSync(diffDir, {recursive: true});
    const base = filename.replace(/\.png$/, '');
    fs.writeFileSync(path.join(diffDir, `${base}-diff.png`), diffPng);
    fs.writeFileSync(path.join(diffDir, `${base}-first.png`), first);
    fs.writeFileSync(path.join(diffDir, `${base}-second.png`), second);
  }
  expect(diffPixels).toBe(0);

  fs.mkdirSync(BASELINE_DIR, {recursive: true});
  fs.writeFileSync(path.join(BASELINE_DIR, filename), first);
}

test.describe('teacher dashboard legacy baselines (capture mode)', () => {
  // TDF-VIS-04
  test('legacy /teacher_dashboard/home', async ({page}) => {
    const {sectionId} = await seedTeacherWithSection(page);

    await captureRouteTwiceAndSave(page, 'td-home-chromium.png', {
      url: '/teacher_dashboard/home',
      selector: REGION_SELECTOR,
      viewport: VIEWPORT,
      // The last async paint on this page: the "Jump to" lesson dropdown
      // renders disabled until /sections/:id/retrieve_lessons_for_dropdown
      // resolves, then enables. Waiting for the enabled state (not just the
      // join-code button, which paints earlier) is the stabilization #7
      // sentinel that makes the two captures identical.
      readySelector: 'button:enabled:has-text("Jump to")',
      cookies: [{name: 'hide_codeai_logo_transition', value: 'true'}],
      fixedTime: FIXED_TIME,
      masks: [MASK_JOIN_CODE, sectionAvatarMask(sectionId)],
    });
  });

  // TDF-VIS-05
  test('legacy .../sections/:id/progress', async ({page}) => {
    const {sectionId} = await seedTeacherWithSection(page);

    // With a unit assigned and students who have made no progress, this
    // renders the populated-but-empty progress grid ("no online work" dashes
    // for both students) — the stable no-progress grid visual-artifacts.md
    // expects for this route.
    await captureRouteTwiceAndSave(page, 'td-progress-chromium.png', {
      url: `/teacher_dashboard/sections/${sectionId}/progress`,
      selector: REGION_SELECTOR,
      viewport: VIEWPORT,
      // Real data cells only exist once progress data has loaded — the table
      // container and student rows render earlier, during the skeleton phase
      // (SkeletonProgressDataColumn's data-testid="skeleton-cell").
      readySelector: '[data-testid^="lesson-data-cell-"]',
      fixedTime: FIXED_TIME,
      // No masks expected for this route (visual-artifacts.md table).
    });
  });

  // TDF-VIS-06
  test('legacy .../sections/:id/roster', async ({page}) => {
    const {sectionId, sectionCode} = await seedTeacherWithSection(page);

    // mask-join-code's declared condition ("if code appears in header")
    // holds: the roster header renders the same JoinLinkCopyButton as home,
    // and the sign-in instructions repeat the code in body text.
    await captureRouteTwiceAndSave(page, 'td-roster-chromium.png', {
      url: `/teacher_dashboard/sections/${sectionId}/roster`,
      selector: REGION_SELECTOR,
      viewport: VIEWPORT,
      readySelector: '#uitest-manage-students-table',
      fixedTime: FIXED_TIME,
      masks: [
        MASK_STUDENT_PASSWORDS,
        MASK_JOIN_CODE,
        joinCodeBodyTextMask(sectionCode),
        MASK_USERNAMES,
      ],
    });
  });

  // TDF-VIS-07
  test('legacy .../sections/:id/login_info', async ({page}) => {
    const {sectionId, sectionCode} = await seedTeacherWithSection(page);

    // Per-run code exposure (F0-T15 probe): the sign-in instructions <li>
    // embeds the code twice (join-link + bare text) — joinCodeBodyTextMask
    // covers both. The four remaining occurrences sit inside the login
    // cards, already covered by MASK_SECRET_WORDS. The join-code BUTTON
    // does not render on this route (probe count 0), so mask-join-code is
    // not applied.
    await captureRouteTwiceAndSave(page, 'td-login_info-chromium.png', {
      url: `/teacher_dashboard/sections/${sectionId}/login_info`,
      selector: REGION_SELECTOR,
      viewport: VIEWPORT,
      readySelector: MASK_SECRET_WORDS,
      fixedTime: FIXED_TIME,
      masks: [MASK_SECRET_WORDS, joinCodeBodyTextMask(sectionCode)],
    });
  });
});
