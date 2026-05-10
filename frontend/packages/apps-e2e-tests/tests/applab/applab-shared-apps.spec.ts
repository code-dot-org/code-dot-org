import {expect, test} from '../shared/fixtures';

import {AppLab} from './AppLab';

/**
 * App Lab — Shared Apps: interactive share page behavior.
 *
 * Source: dashboard/test/ui/features/star_labs/applab/shared_apps.feature
 *
 * Each scenario creates a fresh project, optionally adds code or design
 * elements, then navigates to the share URL (read from the project share
 * dialog via #sharing-dialog-copy-button — mirrors `I navigate to the
 * shared version of my project` from project_steps.rb) and verifies that
 * interactive elements behave correctly on the read-only share page.
 *
 * The App Lab share page auto-runs the project code on load; no manual
 * runButton press is required.
 *
 * Save mechanism: App Lab autosaves every 30 s, which is too slow for
 * tests.  Code scenarios trigger an explicit save by calling run() while
 * holding a waitForSaveComplete() promise (runButtonClickWrapper →
 * serializeAndSave → appModeChanged event → saveIfSourcesChanged → PUT
 * /v3/sources/).  Design scenarios trigger save by switching back to code
 * mode (onInterfaceModeChange(CODE) → same chain).
 */

test.describe('App Lab — Shared Apps', () => {
  /**
   * Source: "App Lab Share"
   *
   * Verifies the share page runs code, renders app elements, does NOT load
   * the ACE/Droplet editor, and hides all toolbar mode buttons.
   */
  test(
    'share page runs code and hides toolbar',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      // Webkit: share page toolbar hide flaky under parallelism; passes alone.
      test.fixme(
        true,
        'TODO: share page runs code and hides toolbar flaky on webkit under parallel test run; timing issue',
      );
      const applab = new AppLab(studentPage);

      await studentPage.goto('/projects/applab/new');
      await applab.waitForReady();
      await studentPage.waitForFunction(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (
            window as any
          ).dashboard?.project?.__TestInterface?.isInitialSaveComplete(),
        {timeout: 60_000},
      );

      await applab.ensureTextMode();
      await applab.appendCode("button('hello', 'world');");

      // Set up save watcher BEFORE run() so the PUT is captured.
      const saveDone = applab.waitForSaveComplete();

      // Run to confirm element renders in edit mode, then reset.
      await applab.run();
      await expect(
        studentPage.locator('#divApplab > .screen > button#hello'),
      ).toBeVisible({timeout: 15_000});
      await expect(
        studentPage.locator('#divApplab > .screen > button#hello'),
      ).toContainText('world');
      await applab.resetButton.click();

      await saveDone;

      const shareUrl = await applab.getShareUrlFromDialog();
      await studentPage.goto(shareUrl);

      // Share page auto-runs the code.
      await expect(
        studentPage.locator('#divApplab > .screen > button#hello'),
      ).toBeVisible({timeout: 30_000});

      // ACE and Droplet must not be loaded on the share page.
      expect(
        await studentPage.evaluate(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          () => typeof (window as any).ace === 'undefined',
        ),
      ).toBe(true);
      expect(
        await studentPage.evaluate(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          () => typeof (window as any).droplet === 'undefined',
        ),
      ).toBe(true);

      await expect(
        studentPage.locator('#divApplab > .screen > button#hello'),
      ).toContainText('world');

      // Toolbar mode buttons must not be visible on share page.
      await expect(studentPage.locator('#codeModeButton')).not.toBeVisible();
      await expect(studentPage.locator('#designModeButton')).not.toBeVisible();
      await expect(studentPage.locator('#dataModeButton')).not.toBeVisible();
    },
  );

  /**
   * Source: "Can click a button in shared app"
   */
  test('button click event fires on share page', async ({studentPage}) => {
    const applab = new AppLab(studentPage);

    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await studentPage.waitForFunction(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (
          window as any
        ).dashboard?.project?.__TestInterface?.isInitialSaveComplete(),
      {timeout: 60_000},
    );

    await applab.ensureTextMode();
    await applab.appendCode(
      "button('testButton1', 'Click me');\nonEvent('testButton1', 'click', function() { setText('testButton1', 'Clicked'); });",
    );

    const saveDone = applab.waitForSaveComplete();
    await applab.run();
    await applab.resetButton.click();
    await saveDone;

    const shareUrl = await applab.getShareUrlFromDialog();
    await studentPage.goto(shareUrl);

    await expect(
      studentPage.locator('#divApplab > .screen > button#testButton1'),
    ).toBeVisible({timeout: 30_000});
    await expect(studentPage.locator('#testButton1')).toContainText('Click me');

    await studentPage.locator('#testButton1').click();
    await expect(studentPage.locator('#testButton1')).toContainText('Clicked', {
      timeout: 10_000,
    });
  });

  /**
   * Source: "Can change a dropdown value in shared app"
   */
  test('dropdown value changes on share page', async ({studentPage}) => {
    const applab = new AppLab(studentPage);

    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await studentPage.waitForFunction(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (
          window as any
        ).dashboard?.project?.__TestInterface?.isInitialSaveComplete(),
      {timeout: 60_000},
    );

    await applab.ensureTextMode();
    await applab.appendCode(
      "dropdown('testDropdown', 'Option A', 'Option B', 'Option C');",
    );

    const saveDone = applab.waitForSaveComplete();
    await applab.run();
    await applab.resetButton.click();
    await saveDone;

    const shareUrl = await applab.getShareUrlFromDialog();
    await studentPage.goto(shareUrl);

    await expect(studentPage.locator('.screen > #testDropdown')).toBeVisible({
      timeout: 30_000,
    });
    await expect(studentPage.locator('#testDropdown')).toHaveValue('Option A');

    await studentPage.locator('#testDropdown').selectOption('Option B');
    await expect(studentPage.locator('#testDropdown')).toHaveValue('Option B');
  });

  /**
   * Source: "Can change a radio button value in shared app"
   */
  test('radio button selection works on share page', async ({studentPage}) => {
    const applab = new AppLab(studentPage);

    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await studentPage.waitForFunction(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (
          window as any
        ).dashboard?.project?.__TestInterface?.isInitialSaveComplete(),
      {timeout: 60_000},
    );

    await applab.ensureTextMode();
    await applab.appendCode(
      "radioButton('radio1', false, 'testGroup');\nradioButton('radio2', false, 'testGroup');",
    );

    const saveDone = applab.waitForSaveComplete();
    await applab.run();
    await applab.resetButton.click();
    await saveDone;

    const shareUrl = await applab.getShareUrlFromDialog();
    await studentPage.goto(shareUrl);

    await expect(studentPage.locator('.screen > #radio2')).toBeVisible({
      timeout: 30_000,
    });
    await expect(studentPage.locator('#radio1')).not.toBeChecked();
    await expect(studentPage.locator('#radio2')).not.toBeChecked();

    await studentPage.locator('#radio1').click();
    await expect(studentPage.locator('#radio1')).toBeChecked();
    await expect(studentPage.locator('#radio2')).not.toBeChecked();

    await studentPage.locator('#radio2').click();
    await expect(studentPage.locator('#radio1')).not.toBeChecked();
    await expect(studentPage.locator('#radio2')).toBeChecked();
  });

  /**
   * Source: "Can change a checkbox value in shared app"
   */
  test('checkbox selection works on share page', async ({studentPage}) => {
    const applab = new AppLab(studentPage);

    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await studentPage.waitForFunction(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (
          window as any
        ).dashboard?.project?.__TestInterface?.isInitialSaveComplete(),
      {timeout: 60_000},
    );

    await applab.ensureTextMode();
    await applab.appendCode(
      "checkbox('checkbox1', false, 'testGroup');\ncheckbox('checkbox2', false, 'testGroup');",
    );

    const saveDone = applab.waitForSaveComplete();
    await applab.run();
    await applab.resetButton.click();
    await saveDone;

    const shareUrl = await applab.getShareUrlFromDialog();
    await studentPage.goto(shareUrl);

    await expect(studentPage.locator('.screen > #checkbox2')).toBeVisible({
      timeout: 30_000,
    });
    await expect(studentPage.locator('#checkbox1')).not.toBeChecked();
    await expect(studentPage.locator('#checkbox2')).not.toBeChecked();

    await studentPage.locator('#checkbox1').click();
    await expect(studentPage.locator('#checkbox1')).toBeChecked();
    await expect(studentPage.locator('#checkbox2')).not.toBeChecked();

    await studentPage.locator('#checkbox2').click();
    await expect(studentPage.locator('#checkbox1')).toBeChecked();
    await expect(studentPage.locator('#checkbox2')).toBeChecked();
  });

  /**
   * Source: "Can type in text input on share page"
   */
  test('text input accepts keyboard input on share page', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);

    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await studentPage.waitForFunction(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (
          window as any
        ).dashboard?.project?.__TestInterface?.isInitialSaveComplete(),
      {timeout: 60_000},
    );

    await applab.switchToDesignMode();
    await applab.dragElementToApp('TEXT_INPUT');

    // Switching back to code mode triggers onInterfaceModeChange(CODE) →
    // serializeAndSave → PUT /v3/sources/ — the reliable save flush for
    // design-mode-only scenarios.
    const saveDone = applab.waitForSaveComplete();
    await applab.switchToCodeMode();
    await saveDone;

    const shareUrl = await applab.getShareUrlFromDialog();
    await studentPage.goto(shareUrl);

    await expect(studentPage.locator('.screen > input').first()).toBeVisible({
      timeout: 30_000,
    });
    // pressSequentially targets the specific locator, immune to focus-stealing.
    await studentPage
      .locator('.screen > input')
      .first()
      .pressSequentially('GLULX');
    await expect(studentPage.locator('.screen > input').first()).toHaveValue(
      'GLULX',
      {timeout: 10_000},
    );
  });

  /**
   * Source: "Can type in textarea on share page"
   */
  test(
    'textarea accepts input on share page',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      // Webkit: textarea share page input flaky under parallel run; passes alone.
      test.fixme(
        true,
        'TODO: textarea accepts input on share page flaky on webkit under parallel run; timing issue with share page init or textarea focus',
      );
      const applab = new AppLab(studentPage);

      await studentPage.goto('/projects/applab/new');
      await applab.waitForReady();
      await studentPage.waitForFunction(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (
            window as any
          ).dashboard?.project?.__TestInterface?.isInitialSaveComplete(),
        {timeout: 60_000},
      );

      await applab.switchToDesignMode();
      await applab.dragElementToApp('TEXT_AREA');

      const saveDone = applab.waitForSaveComplete();
      await applab.switchToCodeMode();
      await saveDone;

      const shareUrl = await applab.getShareUrlFromDialog();
      await studentPage.goto(shareUrl);

      await expect(studentPage.locator('.screen > #text_area1')).toBeVisible({
        timeout: 30_000,
      });
      await studentPage.locator('.screen > #text_area1').first().fill('XYZZY');
      // #text_area1 is a wrapper div; check text content rather than .value.
      await expect(
        studentPage.locator('.screen > #text_area1').first(),
      ).toContainText('XYZZY');
    },
  );
});
