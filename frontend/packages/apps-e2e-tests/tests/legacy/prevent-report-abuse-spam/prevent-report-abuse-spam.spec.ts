import {createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {ReportAbuseSpamPage} from './ReportAbuseSpamPage';

test.describe('Prevent report-abuse spam', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/prevent_report_abuse_spam.feature
   * Scenario: Report Abuse link hidden if the user already reported AppLab project - studio
   * @no_firefox @no_safari
   */
  test('hides help-menu report abuse link after reporting an App Lab project', async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Source scenario is tagged @no_firefox and @no_safari.',
    );

    await createStudent(page, {name: 'Project Maker'});
    const spam = new ReportAbuseSpamPage(page);
    await spam.makeNamedProject('applab', 'App Lab Project 1');
    await spam.openHelpMenu();
    await expect(spam.helpReportAbuseLink()).toBeVisible({timeout: 15_000});

    await spam.submitAbuseReportFrom(spam.helpReportAbuseLink());
    await expect(page).toHaveURL(/projects/, {timeout: 30_000});
    await spam.reloadProjectPage();
    await spam.openHelpMenu();
    await expect(spam.helpReportAbuseLink()).toBeHidden({timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/prevent_report_abuse_spam.feature
   * Scenario: Report Abuse link hidden if the user already reported AppLab project - share page
   * @no_firefox @no_safari
   */
  test('hides footer report abuse link after reporting an App Lab share page', async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Source scenario is tagged @no_firefox and @no_safari.',
    );

    await createStudent(page, {name: 'Project Maker'});
    const spam = new ReportAbuseSpamPage(page);
    await spam.makeNamedProject('applab', 'App Lab Project 2');
    const shareUrl = await spam.openShareDialogAndReadUrl();
    await page.goto(shareUrl, {waitUntil: 'domcontentloaded'});
    await spam.openSmallFooterMenu();
    await expect(spam.footerHowItWorksLink()).toBeVisible({timeout: 15_000});
    await expect(spam.footerReportAbuseLink()).toBeVisible({timeout: 15_000});

    await spam.submitAbuseReportFrom(spam.footerReportAbuseLink());
    await expect(page).toHaveURL(/projects/, {timeout: 30_000});
    await page.reload({waitUntil: 'domcontentloaded'});
    await spam.openSmallFooterMenu();
    await expect(spam.footerHowItWorksLink()).toBeVisible({timeout: 15_000});
    await expect(spam.footerReportAbuseLink()).toBeHidden({timeout: 15_000});
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/projects/prevent_report_abuse_spam.feature
   * Scenario: Report Abuse link hidden if the user already reported GameLab project - studio
   * @no_firefox @no_safari
   */
  test('hides help-menu report abuse link after reporting a Game Lab project', async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Source scenario is tagged @no_firefox and @no_safari.',
    );

    await createStudent(page, {name: 'Project Maker'});
    const spam = new ReportAbuseSpamPage(page);
    await spam.makeNamedProject('gamelab', 'Game Lab Project 1');
    await spam.openHelpMenu();
    await expect(spam.helpReportAbuseLink()).toBeVisible({timeout: 15_000});

    await spam.submitAbuseReportFrom(spam.helpReportAbuseLink());
    await expect(page).toHaveURL(/projects/, {timeout: 30_000});
    await spam.reloadProjectPage();
    await spam.openHelpMenu();
    await expect(spam.helpReportAbuseLink()).toBeHidden({timeout: 15_000});
  });
});
