import {test} from '../../shared/fixtures';

import {SignUpPage} from './SignUpPage';

test.describe('Sign up flow', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/sign_up.feature
   * Scenario: Teacher can create a school associated account in the sign up flow
   */
  test('teacher can create a school-associated account', async ({page}) => {
    const signUp = new SignUpPage(page);

    await signUp.gotoAccountType();
    // Visual checkpoint stub: Cucumber captured the account selection page.
    await signUp.chooseTeacher();
    await signUp.createEmailAccount('teacher');
    await signUp.finishTeacherAccount();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/sign_up.feature
   * Scenario: Student can create an account in the sign up flow
   */
  test('student can create an account', async ({page}) => {
    const signUp = new SignUpPage(page);

    await signUp.gotoAccountType();
    await signUp.chooseStudent();
    await signUp.createEmailAccount('student');
    await signUp.finishStudentAccount('Washington');
    await signUp.expectStudentHome();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/sign_up.feature
   * Scenario: 10yo student hits Colorado lockout
   */
  test('10-year-old student hits Colorado lockout', async ({page}) => {
    const signUp = new SignUpPage(page);

    await signUp.gotoAccountType();
    await signUp.mockCpaExperience();
    await signUp.chooseStudent();
    await signUp.createEmailAccount('student');
    await signUp.finishStudentAccount('Colorado');
    // Visual checkpoint stub: Cucumber captured the Colorado lockout page.
    await signUp.expectColoradoLockout();
  });
});
