import {expect, test} from '../fixtures';
import {WebLab2} from '../pages/weblab2';
import {createStudent, resetSession, signOut} from '../shared/auth';

test.describe('Web Lab 2', () => {
  // Both scenarios carry @no_safari: Safari 16 throws on a regex the app uses
  // that only Safari 16.6+ supports; Saucelabs/webkit here run an older
  // engine. Revisit once min Safari is 17+.
  test.skip(
    ({browserName}) => browserName === 'webkit',
    'Safari 16 regex incompatibility (see weblab2_general.feature / weblab2_preview.feature comment)',
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/weblab2/weblab2_general.feature "Web Lab 2 Instructions and Editor load"
   */
  test(
    'Web Lab 2 Instructions and Editor load',
    {tag: ['@no_safari', '@no_mobile']},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: 'Penelope'});

      const lab = new WebLab2(page);
      await lab.gotoLevel();

      await lab.expectEditorLoaded();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/weblab2/weblab2_preview.feature "Web Lab 2 Preview loads"
   */
  test(
    'Web Lab 2 Preview loads',
    {tag: ['@no_safari', '@no_mobile', '@no_ci']},
    async ({page}) => {
      await resetSession(page);
      await page.goto('/');
      await createStudent(page, {name: 'Penelope'});

      const lab = new WebLab2(page);
      await lab.gotoLevel();

      await lab.waitForPreviewLoaded();
      await expect(lab.helloWorldMessage).toContainText('Hello world!');

      await signOut(page);
    },
  );
});
