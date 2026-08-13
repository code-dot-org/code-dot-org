import {expect, test} from '../../fixtures';
import {TeacherDashboardPage} from '../../pages/teacher-dashboard/teacher-dashboard';
import {createUser} from '../../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../../shared/axe';

// rule id -> failing node count, per surface; both are clean today.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  demoSectionCard: {},
  lessonDropdown: {},
};

test.describe('Demo section card on the teacher homepage', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/teacher_dashboard/demo_section_card.feature "Teacher with zero sections can create a practice section from the homepage"
   */
  test(
    'Teacher with zero sections can create a practice section from the homepage',
    {tag: ['@no_mobile']},
    async ({page, dcdo}) => {
      await page.goto('/');
      await dcdo.mock('hide-teacher-dashboard-logo-animation', true);
      // Not the signInAsNewUser fixture: its resetSession() would clear the
      // DCDO cookie just set above.
      await createUser(page, {type: 'teacher', name: 'Test Teacher'});

      const dashboard = new TeacherDashboardPage(page);
      await dashboard.goto({experiment: 'demo-section'});
      const demoCard = dashboard.demoSectionCard;

      await expect(demoCard.card).toBeVisible();
      await expect(demoCard.card).toContainText('High School Practice Section');
      await expect(demoCard.card).toContainText('Demo');
      expect(
        await analyze(page, {
          include: demoCard.cardSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.demoSectionCard);

      await demoCard.openLessonDropdown();
      expect(
        await analyze(page, {
          include: demoCard.lessonDropdownSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.lessonDropdown);

      await demoCard.progressAction.click();

      await expect(page).toHaveURL(/\/teacher_dashboard\/sections\//);
      await expect(page).toHaveURL(/\/progress/);
    },
  );
});
