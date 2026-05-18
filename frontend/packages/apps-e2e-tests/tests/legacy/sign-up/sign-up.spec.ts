import {test} from '../../shared/fixtures';

import {SignUpPage} from './SignUpPage';

// The shared `test` fixture provides `eyes`; pull it from there.

test.describe('Sign up flow', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/sign_up.feature
   * Scenario: Teacher can create a school associated account in the sign up flow
   */
  test('teacher can create a school-associated account', async ({
    page,
    eyes,
  }) => {
    const signUp = new SignUpPage(page);

    await signUp.gotoAccountType();
    await eyes.open('Teacher Sign up');
    await eyes.check('Account Selection Page');
    await signUp.chooseTeacher();
    await signUp.fillEmailAccount();
    await eyes.check('Login Type Selection Page');
    await signUp.submitEmailAccount('teacher');
    await signUp.fillTeacherAccount();
    await eyes.check('Finish Sign Up Teacher');
    await signUp.submitTeacherAccount();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/sign_up.feature
   * Scenario: Student can create an account in the sign up flow
   */
  test('student can create an account', async ({page, eyes}) => {
    const signUp = new SignUpPage(page);

    await signUp.gotoAccountType();
    await signUp.chooseStudent();
    await signUp.createEmailAccount('student');
    await signUp.fillStudentAccount('Washington');
    await eyes.open('Finish Sign Up Student');
    await eyes.check('Finish Sign Up Student');
    await signUp.submitStudentAccount();
    await signUp.expectStudentHome();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/acquisition_products/sign_up.feature
   * Scenario: 10yo student hits Colorado lockout
   */
  test('10-year-old student hits Colorado lockout', async ({page, eyes}) => {
    const signUp = new SignUpPage(page);

    await signUp.gotoAccountType();
    await signUp.mockCpaExperience();
    await signUp.chooseStudent();
    await signUp.createEmailAccount('student');
    await signUp.finishStudentAccount('Colorado');
    await signUp.expectColoradoLockout();
    await eyes.open('Colorado Lockout');
    await eyes.check('Colorado Lockout');
  });
});
