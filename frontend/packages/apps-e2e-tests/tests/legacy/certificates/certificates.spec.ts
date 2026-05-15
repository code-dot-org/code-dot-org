import {expect, test} from '@playwright/test';

import {createStudent, createTeacher} from '../../shared/auth';

import {CertificatePage} from './CertificatePage';
import {MinecraftCertificatePage} from './MinecraftCertificatePage';

/**
 * Complete the CSF test course for the current student session.
 *
 * @param certificatePage - certificate page object
 */
async function completeCsfCourse(
  certificatePage: CertificatePage,
): Promise<void> {
  await certificatePage.completeUnit('ui-test-csf', 1);
}

test.describe('certificate pages', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/certificates/certificates.feature
   * Scenario: share page preserves certificate when redirecting
   */
  test('old certificate share URL preserves the personalized image', async ({
    page,
  }) => {
    const certificates = new CertificatePage(page);
    const minecraft = new MinecraftCertificatePage(page);

    await certificates.resetSession();
    await minecraft.resetMinecraftProgress();
    await certificates.finishHourOfCode('mc');
    await certificates.personalize('Robo Coder');
    await certificates.navigateToSharePageFromQuery();
    await certificates.expectCustomImageParams({
      name: 'Robo Coder',
      course: 'mc',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/certificates/certificates.feature
   * Scenario: certificate page with no course name
   */
  test('generic certificate page has social and print controls', async ({
    page,
  }) => {
    const certificates = new CertificatePage(page);

    await certificates.resetSession();
    await certificates.openCongrats();
    await certificates.expectSocialShareControls();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/certificates/certificates.feature
   * Scenario: customized dashboard certificate pages with no course name
   */
  test('generic certificate can be personalized, shared, and printed', async ({
    page,
  }) => {
    const certificates = new CertificatePage(page);

    await certificates.resetSession();
    await certificates.openCongrats();
    await certificates.expectPrintLink();
    // Visual checkpoint stub: uncustomized congrats page.

    await certificates.personalize('Robo Códer');
    // Visual checkpoint stub: personalized congrats page.

    await certificates.openCertificateImagePage();
    // Visual checkpoint stub: certificate page.

    await certificates.openPrintPageFromSharePage();
    // Visual checkpoint stub: print certificate page.
  });
});

test.describe('CSF certificate pages', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/certificates/csf_certificates.feature
   * Scenario: CSF uncustomized dashboard certificate pages
   */
  test('completed CSF course shows uncustomized certificate routes', async ({
    page,
  }) => {
    const certificates = new CertificatePage(page);

    await createStudent(page, {name: 'Student1'});
    await completeCsfCourse(certificates);

    await certificates.openCongrats();
    await certificates.openCourseCongrats('ui-test-csf', 'dWktdGVzdC1jc2Y%3D');
    await certificates.expectPrintLink();
    await certificates.expectGeneratedCertificateImage();

    await certificates.openCertificateImagePage();
    await certificates.openPrintPageFromSharePage();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/certificates/csf_certificates.feature
   * Scenario: CSF certificate pages
   */
  test('completed CSF course certificate can be personalized', async ({
    page,
  }) => {
    const certificates = new CertificatePage(page);

    await createStudent(page, {name: 'Student1'});
    await completeCsfCourse(certificates);

    await certificates.openCourseCongrats('ui-test-csf', 'dWktdGVzdC1jc2Y%3D');
    await certificates.expectCertificateReady();
    await expect(page.locator('.fa-x-twitter')).toBeVisible();
    await certificates.expectPrintLink();
    // Visual checkpoint stub: uncustomized CSF certificate.

    await certificates.personalize('Robo Códer');
    // Visual checkpoint stub: customized CSF certificate.
  });
});

test.describe('Hour of Code certificate pages', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/certificates/hoc_certificates.feature
   * Scenario: Completing Minecraft HoC should go to certificate page and generate a certificate
   */
  test('completing Minecraft Hour of Code generates a personalized certificate', async ({
    page,
  }) => {
    const certificates = new CertificatePage(page);
    const minecraft = new MinecraftCertificatePage(page);

    await certificates.resetSession();
    await minecraft.resetMinecraftProgress();
    await minecraft.loadFinalLevel();
    await minecraft.completeFinalLevel();
    await certificates.expectCertificateReady();
    await certificates.personalize('Robo Códer');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/certificates/hoc_certificates.feature
   * Scenario: non-mee 3rd party tutorial redirects to congrats page with params
   */
  test(
    'non-mee third-party tutorial redirects to congrats with params',
    {tag: '@no_safari'},
    async ({browserName, page}) => {
      test.skip(
        browserName === 'webkit',
        'Source scenario is @no_safari: dashboard/test/ui/features/teacher_tools/certificates/hoc_certificates.feature "non-mee 3rd party tutorial redirects to congrats page with params"',
      );

      const certificates = new CertificatePage(page);

      await certificates.resetSession();
      await certificates.openCongrats();
      await certificates.finishHourOfCode('kodable');
      await expect(page).toHaveURL(/\?i=.*&s=a29kYWJsZQ%3D%3D$/);
      await certificates.personalize('Robo Coder');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/certificates/hoc_certificates.feature
   * Scenario: flappy course certificates
   */
  test('flappy certificate can be personalized, shared, and printed', async ({
    page,
  }) => {
    const certificates = new CertificatePage(page);

    await certificates.resetSession();
    await certificates.finishHourOfCode('flappy');
    await certificates.expectCertificateReady();
    await expect(page.locator('.fa-x-twitter')).toBeVisible();
    await certificates.expectPrintLink();
    // Visual checkpoint stub: uncustomized flappy certificate.

    await certificates.personalize('Robo Códer');
    // Visual checkpoint stub: customized flappy certificate.

    await certificates.openCertificateImagePage();
    await certificates.openPrintPageFromSharePage();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/certificates/hoc_certificates.feature
   * Scenario: oceans course certificates
   */
  test('oceans certificate can be personalized, shared, and printed', async ({
    page,
  }) => {
    const certificates = new CertificatePage(page);

    await certificates.resetSession();
    await certificates.finishHourOfCode('oceans');
    await certificates.expectCertificateReady();
    await expect(page.locator('.fa-x-twitter')).toBeVisible();
    await certificates.expectPrintLink();
    // Visual checkpoint stub: uncustomized oceans certificate.

    await certificates.personalize('Robo Códer');
    // Visual checkpoint stub: customized oceans certificate.

    await certificates.openCertificateImagePage();
    // Visual checkpoint stub: oceans certificate page.

    await certificates.openPrintPageFromSharePage();
    // Visual checkpoint stub: oceans print certificate page.
  });
});

test.describe('batch certificate printing', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/hour_of_code/hoc_batch_certificates.feature
   * Scenario: Printing a batch of certificates
   */
  test('teacher prints a batch of certificates', async ({page}) => {
    const certificates = new CertificatePage(page);

    await createTeacher(page);
    await certificates.openBatchCertificates();
    await certificates.submitBatchCertificates(['Alice', 'Bob', 'Charlie']);
  });
});
