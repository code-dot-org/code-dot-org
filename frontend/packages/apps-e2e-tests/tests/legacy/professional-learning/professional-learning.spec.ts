import {
  createTeacher,
  grantFacilitatorAccess,
  grantUniversalInstructorAccess,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {ProfessionalLearningPage} from './ProfessionalLearningPage';

test.describe('Professional Learning landing page', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pl_landing_page.feature
   * Scenario: New teacher without PL history sees relevant content sections
   */
  test('new teacher sees default Professional Learning content', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'New Teacher'});
    const pl = new ProfessionalLearningPage(page);

    await pl.goto();
    await pl.expectEnglishNewTeacherContent();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pl_landing_page.feature
   * Scenario: Universal Instructor sees relevant content sections
   */
  test('universal instructor sees Instructor Center', async ({page}) => {
    await createTeacher(page, {name: 'PL Instructor'});
    await grantUniversalInstructorAccess(page);
    const pl = new ProfessionalLearningPage(page);

    await pl.goto();
    await pl.openTab('Instructor Center');
    await expect(
      page.getByRole('button', {name: 'Create a section'}),
    ).toBeVisible({
      timeout: 30_000,
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pl_landing_page.feature
   * Scenario: Teacher with Self-paced PL courses sees relevant content sections
   */
  test('teacher with self-paced PL course sees Continue course button', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Self-paced Teacher'});
    const pl = new ProfessionalLearningPage(page);

    await pl.goto();
    await pl.expectEnglishNewTeacherContent();
    await pl.startSelfPacedCourse();
    await pl.goto();
    await expect(page.getByRole('link', {name: /Continue course/})).toBeVisible(
      {
        timeout: 30_000,
      },
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pl_landing_page.feature
   * Scenario: Facilitator sees relevant content sections
   */
  test('facilitator sees Facilitator Center', async ({page}) => {
    await createTeacher(page, {name: 'PL Facilitator'});
    await grantFacilitatorAccess(page);
    const pl = new ProfessionalLearningPage(page);

    await pl.goto();
    await pl.openTab('Facilitator Center');
    await expect(
      page.getByRole('link', {name: 'View workshop dashboard'}),
    ).toHaveAttribute('href', /\/pd\/workshop_dashboard/);
  });
});

test.describe('Global Edition Farsi Professional Learning landing page', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * Scenario: New teacher without PL history sees relevant content sections for Farsi MVP
   */
  test('new teacher sees reduced Farsi Professional Learning content', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'New Teacher'});
    const pl = new ProfessionalLearningPage(page);

    await pl.goto({farsi: true});
    await pl.expectFarsiLandingContent();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * Scenario: Universal Instructor sees Instructor Center in Farsi MVP
   */
  test('universal instructor still sees Instructor Center in Farsi MVP', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'PL Instructor'});
    await grantUniversalInstructorAccess(page);
    const pl = new ProfessionalLearningPage(page);

    await pl.goto();
    await expect(pl.tab('Instructor Center')).toBeVisible({timeout: 30_000});

    await pl.goto({farsi: true});
    await pl.expectFarsiLandingContent();
    await expect(
      page.locator('button#myPLTabs-tab-instructorCenter'),
    ).toBeVisible({timeout: 30_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/pl_landing_page.feature
   * Scenario: Teacher with Self-paced PL courses sees Continue course button in Farsi MVP
   */
  test('teacher with self-paced PL course sees Farsi Continue course button', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Self-paced Teacher'});
    const pl = new ProfessionalLearningPage(page);

    await pl.startSelfPacedCourse();
    await pl.goto();
    await expect(page.getByRole('link', {name: /Continue course/})).toBeVisible(
      {
        timeout: 30_000,
      },
    );

    await pl.goto({farsi: true});
    await expect(page.getByRole('link', {name: /ادامه دوره/})).toBeVisible({
      timeout: 30_000,
    });
  });
});
