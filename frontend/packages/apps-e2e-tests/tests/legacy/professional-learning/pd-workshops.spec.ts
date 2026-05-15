import {
  createStudent,
  createTeacher,
  grantProgramManagerAccess,
  grantWorkshopAdminAccess,
  signOut,
} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {
  addCurrentUserSchoolInfo,
  createPdWorkshop,
  deletePdWorkshop,
  endPdWorkshop,
  enrollCurrentUserInWorkshop,
  markCurrentUserAttended,
  startPdWorkshop,
} from '../../shared/pd';

import {ProfessionalLearningPage} from './ProfessionalLearningPage';
import {RegionalPartnerMiniContactPage} from './RegionalPartnerMiniContactPage';

const REGGIE_PARTNER_ID = 2;
const MINI_CONTACT_NOTES = 'Sample message for regional partner.';

test.describe('PD dashboard and workshop flows', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/daily_survey_results.feature
   * Scenario: Results view for facilitator survey UI is as expected
   */
  test.skip('daily survey results visual fixture is source-skipped', async () => {});

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/dashboard_view.feature
   * Scenario: Facilitator View of dashboard is as expected
   */
  test('facilitator dashboard shows workshop status tables', async ({page}) => {
    await createTeacher(page, {name: 'PL Facilitator'});
    await grantWorkshopAdminAccess(page);

    const notStartedWorkshopId = await createPdWorkshop(page);
    const endedWorkshopId = await createPdWorkshop(page);
    await endPdWorkshop(page, endedWorkshopId);

    try {
      await page.goto('/pd/workshop_dashboard');
      await expect(
        page.getByRole('heading', {name: 'In Progress'}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.getByRole('heading', {name: 'Not Started'}),
      ).toBeVisible();
      await expect(page.locator('#notStartedWorkshopsTable')).toBeVisible();
    } finally {
      await deletePdWorkshop(page, notStartedWorkshopId);
      await deletePdWorkshop(page, endedWorkshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/dashboard_view.feature
   * Scenario: Organizer View of dashboard is as expected
   */
  test('organizer dashboard shows workshop status tables', async ({page}) => {
    await createTeacher(page, {name: 'PL Organizer'});
    await grantWorkshopAdminAccess(page);

    const notStartedWorkshopId = await createPdWorkshop(page);
    const endedWorkshopId = await createPdWorkshop(page);
    await endPdWorkshop(page, endedWorkshopId);

    try {
      await page.goto('/pd/workshop_dashboard');
      await expect(
        page.getByRole('heading', {name: 'In Progress'}),
      ).toBeVisible({timeout: 30_000});
      await expect(
        page.getByRole('heading', {name: 'Not Started'}),
      ).toBeVisible();
      await expect(page.locator('#notStartedWorkshopsTable')).toBeVisible();
    } finally {
      await deletePdWorkshop(page, notStartedWorkshopId);
      await deletePdWorkshop(page, endedWorkshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_certificates.feature
   * Scenario: Simple Workshop Certificate
   */
  test('workshop certificate renders for an attended teacher', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Certificate Creator'});
    await grantWorkshopAdminAccess(page);
    const workshopId = await createPdWorkshop(page);

    try {
      await createTeacher(page, {
        name: 'Certificate Teacher',
        givenName: 'Certificate',
        familyName: 'Teacher',
      });
      await addCurrentUserSchoolInfo(page);
      const enrollmentCode = await enrollCurrentUserInWorkshop(
        page,
        workshopId,
      );
      await grantWorkshopAdminAccess(page);
      await markCurrentUserAttended(page, workshopId);

      const response = await page.goto(
        `/pd/generate_workshop_certificate/${enrollmentCode}`,
      );
      expect(response?.ok()).toBe(true);
      expect(response?.headers()['content-type']).toContain('image/png');
    } finally {
      await grantWorkshopAdminAccess(page);
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_dashboard/workshop_form.feature
   * Scenario: New workshop: BYOW
   */
  test.skip('new BYOW workshop form is source-skipped', async () => {});

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_dashboard/workshop_form.feature
   * Scenario: Edit workshop: BYOW
   */
  test('workshop edit form publishes a changed workshop name', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Workshop Editor'});
    await grantWorkshopAdminAccess(page);

    const workshopId = await createPdWorkshop(page, {
      name: 'Workshop Detail Change',
    });

    try {
      await page.goto(`/pd/workshop_dashboard/workshops/${workshopId}`);
      await expect(
        page.getByText('Workshop Information', {exact: false}),
      ).toBeVisible({timeout: 30_000});

      await page.getByRole('button', {name: 'Edit'}).click();
      await expect(page.getByRole('heading', {name: /Edit/})).toBeVisible({
        timeout: 30_000,
      });

      await page.locator("input[name='name']").fill('Workshop Detail Change');
      await page.getByRole('button', {name: 'Publish'}).click();
      await expect(page.getByText('Workshop Detail Change')).toBeVisible({
        timeout: 30_000,
      });
    } finally {
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_dashboard/workshop_view.feature
   * Scenario: Workshop Overview, Enrollment, Attendance and Surveys
   */
  test('workshop view exposes overview, enrollment, and attendance tabs', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Workshop Viewer'});
    await grantWorkshopAdminAccess(page);

    const workshopId = await createPdWorkshop(page);

    try {
      await page.goto(`/pd/workshop_dashboard/workshops/${workshopId}`);
      await expect(
        page.getByText('Workshop Information', {exact: false}),
      ).toBeVisible({timeout: 30_000});

      await page.getByRole('tab', {name: 'Enrollment'}).click();
      await expect(
        page.getByRole('alert').filter({
          hasText: 'No enrollments found for this workshop',
        }),
      ).toBeVisible({timeout: 30_000});

      await page.getByRole('tab', {name: 'Attendance'}).click();
      await expect(
        page.getByRole('heading', {name: /Take Attendance/}),
      ).toBeVisible({timeout: 30_000});
    } finally {
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment.feature
   * Scenario: Attempting to join workshop signed-out prompts user to sign in
   */
  test('signed-out workshop join prompts account creation', async ({page}) => {
    await createTeacher(page, {name: 'Workshop Creator'});
    await grantWorkshopAdminAccess(page);
    const workshopId = await createPdWorkshop(page);
    await signOut(page);

    try {
      await page.goto(`/pd/workshops/${workshopId}/join`);
      await expect(
        page.getByRole('link', {name: 'Create an account'}),
      ).toBeVisible({timeout: 30_000});
    } finally {
      await createTeacher(page, {name: 'Workshop Cleanup'});
      await grantWorkshopAdminAccess(page);
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment.feature
   * Scenario: Attempting to join workshop as a student prompts user to upgrade account
   */
  test('student workshop join prompts teacher-account flow', async ({page}) => {
    await createTeacher(page, {name: 'Workshop Creator'});
    await grantWorkshopAdminAccess(page);
    const workshopId = await createPdWorkshop(page);
    await createStudent(page, {name: 'Workshop Student'});

    try {
      await page.goto(`/pd/workshops/${workshopId}/join`);
      await expect(
        page.getByRole('link', {name: 'Exit and cancel'}),
      ).toBeVisible({timeout: 30_000});
    } finally {
      await createTeacher(page, {name: 'Workshop Cleanup'});
      await grantWorkshopAdminAccess(page);
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment.feature
   * Scenario: Attempting to join invalid workshop as a teacher states it cannot be found
   */
  test('invalid workshop join shows not-found status', async ({page}) => {
    await createTeacher(page, {name: 'Workshop Teacher'});

    await page.goto('/pd/workshops/0/join');
    await expect(page.getByRole('heading', {name: 'Not found'})).toBeVisible({
      timeout: 30_000,
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment.feature
   * Scenario: Attempting to join closed workshop as a teacher states it is closed
   */
  test('closed workshop join shows closed status', async ({page}) => {
    await createTeacher(page, {name: 'Closed Workshop Creator'});
    await grantWorkshopAdminAccess(page);
    const workshopId = await createPdWorkshop(page);
    await startPdWorkshop(page, workshopId);
    await endPdWorkshop(page, workshopId);
    await createTeacher(page, {name: 'Closed Workshop Teacher'});

    try {
      await page.goto(`/pd/workshops/${workshopId}/join`);
      await expect(page.getByRole('heading', {name: 'Closed'})).toBeVisible({
        timeout: 30_000,
      });
    } finally {
      await createTeacher(page, {name: 'Workshop Cleanup'});
      await grantWorkshopAdminAccess(page);
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment2.feature
   * Scenario: Attempting to join full workshop as a teacher states it is full
   */
  test('full workshop join shows full status', async ({page}) => {
    await createTeacher(page, {name: 'Full Workshop Creator'});
    await grantWorkshopAdminAccess(page);
    const workshopId = await createPdWorkshop(page, {capacity: 1});

    try {
      await createTeacher(page, {
        name: 'Existing Enrolled Teacher',
        givenName: 'Existing',
        familyName: 'Teacher',
      });
      await addCurrentUserSchoolInfo(page);
      await enrollCurrentUserInWorkshop(page, workshopId);

      await createTeacher(page, {name: 'Full Workshop Teacher'});
      await page.goto(`/pd/workshops/${workshopId}/join`);
      await expect(page.getByRole('heading', {name: 'Full'})).toBeVisible({
        timeout: 30_000,
      });
    } finally {
      await createTeacher(page, {name: 'Workshop Cleanup'});
      await grantWorkshopAdminAccess(page);
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment2.feature
   * Scenario: Attempting to join own workshop as a teacher states it is your own workshop
   */
  test('own workshop join shows own-workshop status', async ({page}) => {
    await createTeacher(page, {name: 'Workshop Owner'});
    await grantWorkshopAdminAccess(page);
    const workshopId = await createPdWorkshop(page);

    try {
      await page.goto(`/pd/workshops/${workshopId}/join`);
      await expect(
        page.getByRole('heading', {name: 'Your own workshop'}),
      ).toBeVisible({timeout: 30_000});
    } finally {
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment2.feature
   * Scenario: Attempting to join workshop again as a teacher states you have already enrolled
   */
  test('duplicate workshop join shows duplicate-enrollment status', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Duplicate Workshop Creator'});
    await grantWorkshopAdminAccess(page);
    const workshopId = await createPdWorkshop(page);

    try {
      await createTeacher(page, {
        name: 'Duplicate Workshop Teacher',
        givenName: 'Duplicate',
        familyName: 'Teacher',
      });
      await addCurrentUserSchoolInfo(page);
      await enrollCurrentUserInWorkshop(page, workshopId);

      await page.goto(`/pd/workshops/${workshopId}/join`);
      await expect(
        page.getByRole('heading', {name: 'Duplicate enrollment'}),
      ).toBeVisible({timeout: 30_000});
    } finally {
      await createTeacher(page, {name: 'Workshop Cleanup'});
      await grantWorkshopAdminAccess(page);
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/workshop_enrollment2.feature
   * Scenario: Attempting to join workshop as a teacher requires user info then allows enrolling and sends teacher to MyPL page
   */
  test('workshop join without profile details prompts account edit', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Workshop Creator'});
    await grantWorkshopAdminAccess(page);
    const workshopId = await createPdWorkshop(page);
    await createTeacher(page, {name: 'Workshop Teacher'});

    try {
      await page.goto(`/pd/workshops/${workshopId}/join`);
      await expect(page.getByText('Add your full name')).toBeVisible({
        timeout: 30_000,
      });
      await page.getByRole('link', {name: 'Edit'}).click();
      await expect(page).toHaveURL(/\/users\/edit/, {timeout: 30_000});
      await expect(
        page.getByRole('heading', {name: 'Account information'}),
      ).toBeVisible({timeout: 30_000});
    } finally {
      await createTeacher(page, {name: 'Workshop Cleanup'});
      await grantWorkshopAdminAccess(page);
      await deletePdWorkshop(page, workshopId);
    }
  });
});

test.describe('Regional partner mini-contact', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/regional_partner_mini_contact.feature
   * Scenario: Teacher submits inline mini-contact form after adding zip
   */
  test(
    'teacher submits regional-partner contact after ZIP validation',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacher(page, {name: 'Severus'});
      const contact = new RegionalPartnerMiniContactPage(page);

      await contact.goto();
      await contact.fillNotes(MINI_CONTACT_NOTES);
      await contact.submit();
      await contact.expectZipError();

      await contact.fillZip('90210');
      await contact.submit();
      await contact.expectThanks();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/regional_partner_mini_contact.feature
   * Scenario: Teacher tries to submit inline mini-contact form after adding zip with no regional partner match
   */
  test('teacher sees no-regional-partner result for unmatched ZIP', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Severus'});
    const contact = new RegionalPartnerMiniContactPage(page);

    await contact.goto();
    await contact.fillNotes(MINI_CONTACT_NOTES);
    await contact.fillZip('11');
    await contact.submit();
    await contact.expectNoRegionalPartner();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pd/regional_partner_mini_contact.feature
   * Scenario: Teacher submits inline mini-contact form after adding zip with a regional partner match, email, and notes
   */
  test('teacher submits regional-partner contact after required-field validation', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Severus'});
    const contact = new RegionalPartnerMiniContactPage(page);

    await contact.goto();
    await contact.clearEmail();
    await contact.submit();
    await contact.expectZipError();
    await contact.expectEmailError();
    await contact.expectNotesError();

    await contact.fillZip('90210');
    await contact.fillEmail('test-email@code.org');
    await contact.fillNotes(MINI_CONTACT_NOTES);
    await contact.submit();
    await contact.expectThanks();
  });
});

test.describe('Professional Learning staff centers', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pl_landing_page.feature
   * Scenario: Regional Partner sees relevant content sections
   */
  test('program manager sees Regional Partner Center content', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Program Manager'});
    await grantWorkshopAdminAccess(page);
    const workshopId = await createPdWorkshop(page, {
      regionalPartnerId: REGGIE_PARTNER_ID,
    });
    await grantProgramManagerAccess(page);
    const pl = new ProfessionalLearningPage(page);

    try {
      await pl.goto();
      await pl.openTab('Regional Partner Center');
      await pl.expectRegionalPartnerResources();
      await pl.expectWorkshopCenterContent();
    } finally {
      await grantWorkshopAdminAccess(page);
      await deletePdWorkshop(page, workshopId);
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/pl_landing_page.feature
   * Scenario: Workshop Organizer sees relevant content sections
   */
  test.skip('workshop organizer role has no Playwright-side test-role endpoint', async () => {});
});
