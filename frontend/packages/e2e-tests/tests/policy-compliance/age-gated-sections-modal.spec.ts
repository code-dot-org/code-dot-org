import {expect, test} from '../fixtures';
import {TeacherDashboardPage} from '../pages/teacher-dashboard/teacher-dashboard';
import {createTeacherAssociatedStudent, signIn, signOut} from '../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {assignCourseAndUnitAsStudent} from '../shared/sections';

// cap_steps.rb's @cap_lockout_date: DateTime.parse('2024-07-01T00:00:00MDT').
const CAP_LOCKOUT_DATE = '2024-07-01T06:00:00.000Z';
// cap_steps.rb's @cap_start_date, i.e. the lockout date .ago(1.year). Not
// 2023-07-01T06:00Z: ActiveSupport's DateTime#ago is
// `self + Rational(seconds.round, 86400)`, so it consumes 1.year as its integer
// seconds (31,556,952 = the 365.2425-day mean Gregorian year) rather than
// stepping back a calendar year, landing 1 day 5h49m12s earlier.
const CAP_START_DATE = '2023-07-02T00:10:48.000Z';

test.describe('Age Gated Sections Modal and Banner', () => {
  test.beforeEach(async ({page, dcdo}) => {
    await page.goto('/');
    await dcdo.mock('cap_CO_start_date_override', CAP_START_DATE);
    await dcdo.mock('cap_CO_lockout_date_override', CAP_LOCKOUT_DATE);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_sections_modal.feature
   * "Teacher viewing their section with no at risk age gated students should not see age gated sections banner"
   */
  test('Teacher viewing their section with no at risk age gated students should not see age gated sections banner', async ({
    page,
  }) => {
    const dashboard = new TeacherDashboardPage(page);

    const {email, password} = await createTeacherAssociatedStudent(page, {
      studentName: 'Sally',
      age: '10',
    });
    await assignCourseAndUnitAsStudent(page, {
      courseName: 'allthethingscourse',
      unitPosition: 1,
    });

    await signOut(page);
    await page.goto('/');
    await signIn(page, {email, password});

    await dashboard.goto();
    await expect(dashboard.sectionList).toBeVisible();
    // The list container is present from domcontentloaded; wait for the real
    // card (not the "Loading..." skeleton) to confirm the section actually
    // rendered before checking the banner.
    await expect(dashboard.sectionList).toContainText('Untitled Section');
    await expect(dashboard.ageGatedSectionsBanner).toBeHidden();

    // Clean surface. Scoped to #main_content to exclude shared header/footer
    // chrome, measured against test-studio across chromium/firefox/webkit.
    const EXPECTED_VIOLATIONS: Record<string, number> = {};
    expect(
      await analyze(page, {
        include: dashboard.mainContentSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/age_gated_sections_modal.feature
   * "Teacher viewing their sections with at risk age gated students should not see age gated sections banner"
   */
  test('Teacher viewing their sections with at risk age gated students should not see age gated sections banner', async ({
    page,
  }) => {
    const dashboard = new TeacherDashboardPage(page);

    const {email, password} = await createTeacherAssociatedStudent(page, {
      studentName: 'Sally',
      authorized: true,
      age: '10',
      usState: 'CO',
      createdAt: CAP_LOCKOUT_DATE,
    });
    await assignCourseAndUnitAsStudent(page, {
      courseName: 'allthethingscourse',
      unitPosition: 1,
    });

    await signOut(page);
    await page.goto('/');
    await signIn(page, {email, password});

    await dashboard.goto();
    await expect(dashboard.sectionList).toBeVisible();
    await expect(dashboard.sectionList).toContainText('Untitled Section');
    await expect(dashboard.ageGatedSectionsBanner).toBeHidden();
  });
});
