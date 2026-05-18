import {createStudent, createTeacher} from '../../shared/auth';
import {test} from '../../shared/fixtures';

import {ReportAbusePage} from './ReportAbusePage';

/**
 * Report abuse form — /report_abuse, three auth contexts.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/report_abuse.feature
 */

test.describe('Report abuse form', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/report_abuse.feature
   * Scenario: Reporting abuse while signed-out
   */
  test('reporting abuse while signed out redirects to support', async ({
    page,
  }) => {
    const reportAbuse = new ReportAbusePage(page);
    await reportAbuse.goto();
    await reportAbuse.fillSignedOutReport();
    await reportAbuse.submitAndExpectSupportRedirect();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/report_abuse.feature
   * Scenario: Reporting abuse as a signed-in student
   */
  test('reporting abuse as a signed-in student redirects to support', async ({
    page,
  }) => {
    await createStudent(page, {name: 'Harry'});
    const reportAbuse = new ReportAbusePage(page);
    await reportAbuse.goto();
    await reportAbuse.fillStudentReport();
    await reportAbuse.submitAndExpectSupportRedirect();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/report_abuse.feature
   * Scenario: Reporting abuse as a signed-in teacher
   */
  test('reporting abuse as a signed-in teacher redirects to support', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'Dumbledore'});
    const reportAbuse = new ReportAbusePage(page);
    await reportAbuse.goto();
    await reportAbuse.fillTeacherReport();
    await reportAbuse.submitAndExpectSupportRedirect();
  });
});
