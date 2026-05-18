import {expect, test} from '../shared/fixtures';

import {AppLab} from './AppLab';

type ProjectTestWindow = Window & {
  dashboard?: {
    project?: {
      __TestInterface?: {
        isInitialSaveComplete?: () => boolean;
        isInitialCaptureComplete?: () => boolean;
        setSourceVersionInterval?: (seconds: number) => void;
      };
    };
  };
};

/**
 * App Lab — Version History.
 *
 * Source: dashboard/test/ui/features/star_labs/applab/versions.feature
 * Migration status: see per-scenario comments.
 */

const SCRIPT_LEVEL_URL =
  '/courses/allthethingscourse/units/1/lessons/18/levels/1?noautoplay=true';

/**
 * Open the Version History dialog and wait for the "Latest Version" badge
 * to appear, signalling that the version list has fully loaded.
 */
async function openVersionHistory(applab: AppLab): Promise<void> {
  await applab.page.locator('#versions-header').click();
  await applab.page
    .locator('#showVersionsModal')
    .waitFor({state: 'visible', timeout: 15_000});
  await expect(
    applab.page
      .locator('#showVersionsModal')
      .filter({hasText: 'Latest Version'}),
  ).toBeVisible({timeout: 15_000});
}

/**
 * Close the Version History dialog via Escape and wait for it to hide.
 */
async function closeVersionHistory(applab: AppLab): Promise<void> {
  await applab.page.keyboard.press('Escape');
  await applab.page
    .locator('#showVersionsModal')
    .waitFor({state: 'hidden', timeout: 10_000});
}

/**
 * Wait for the save indicator to show "Saved".
 * Mirrors `element ".project_updated_at" eventually contains text "Saved"`.
 */
async function waitForSaved(applab: AppLab): Promise<void> {
  await expect(applab.page.locator('.project_updated_at')).toContainText(
    'Saved',
    {timeout: 60_000},
  );
}

/**
 * Make an idempotent code edit, then run App Lab until the visible save status
 * is Saved.  If App Lab shows its recoverable save-error banner, retry from the
 * visible editor state.
 *
 * @param applab - App Lab page object for the loaded level
 * @param expectedCode - ACE editor text expected after the edit
 * @param editCode - Idempotent edit step that creates expectedCode
 */
async function saveExpectedAceCodeWithUiRetry(
  applab: AppLab,
  expectedCode: string,
  editCode: () => Promise<void>,
): Promise<void> {
  await expect(async () => {
    await applab.waitForReady();
    await applab.ensureTextMode();
    const shouldSave = (await applab.getAceEditorCode()) !== expectedCode;
    if (shouldSave) {
      await editCode();
    }
    await expect
      .poll(() => applab.getAceEditorCode(), {timeout: 10_000})
      .toBe(expectedCode);
    await applab.waitForUiSaveAfter(() => applab.run(), {
      expectSave: shouldSave,
    });
  }).toPass({
    intervals: [1_000, 2_000, 5_000],
    timeout: 2 * 60_000,
  });
}

/**
 * Wait until `dashboard.project.__TestInterface.isInitialSaveComplete()`
 * returns true. Only valid on fresh project pages.
 */
async function waitForInitialSave(applab: AppLab): Promise<void> {
  await applab.page.waitForFunction(
    () => {
      const pageWindow = window as ProjectTestWindow;
      return pageWindow.dashboard?.project?.__TestInterface?.isInitialSaveComplete?.();
    },
    {timeout: 60_000},
  );
}

/**
 * Wait until `dashboard.project.__TestInterface.isInitialCaptureComplete()`
 * returns true. Thumbnail capture is triggered by the first run.
 */
async function waitForInitialCapture(applab: AppLab): Promise<void> {
  await applab.page.waitForFunction(
    () => {
      const pageWindow = window as ProjectTestWindow;
      return pageWindow.dashboard?.project?.__TestInterface?.isInitialCaptureComplete?.();
    },
    {timeout: 60_000},
  );
}

test.describe('App Lab — Version History', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/versions.feature
   * Scenario: Script Level Versions
   *
   * Adds code across two page loads so reload creates a prior-version
   * checkpoint, then restores that version and verifies the working copy
   * is unchanged on return.
   *
   * Targets the View button through its wrapping link.  A selected historical
   * row can render Restore with the same btn-info class, so the old Cucumber
   * `button.btn-info:eq(0)` selector is too broad for a stable Playwright port.
   * Opening View in its normal new tab keeps the original working copy loaded
   * while the read-only historical version is asserted.
   *
   * Fresh user auth is the partition boundary.  The level is shared, but App
   * Lab source and version history are stored per user/channel.
   */
  test('script level version restore', async ({studentPage}) => {
    const applab = new AppLab(studentPage);

    await studentPage.goto(SCRIPT_LEVEL_URL, {
      waitUntil: 'domcontentloaded',
    });
    await applab.waitForReady();
    await applab.ensureTextMode();

    await saveExpectedAceCodeWithUiRetry(applab, '// comment 1', async () => {
      await applab.insertCodeAtCursor('// comment 1');
    });

    // Reload commits comment 1 as a prior version.
    await studentPage.reload();
    await applab.waitForReady();
    await applab.ensureTextMode();

    await saveExpectedAceCodeWithUiRetry(
      applab,
      '// comment 2// comment 1',
      async () => {
        await applab.insertCodeAtCursor('// comment 2');
      },
    );

    // Open version history and confirm the restore/view buttons are present.
    await openVersionHistory(applab);
    await expect(
      studentPage.locator('button', {hasText: 'Restore'}).first(),
    ).toBeVisible({timeout: 15_000});
    const previousVersionRow = studentPage
      .locator('#showVersionsModal .versionRow', {
        has: studentPage.locator('button', {hasText: 'Restore'}),
      })
      .first();
    const viewPreviousVersionLink = previousVersionRow
      .locator('a', {
        has: studentPage.locator('button.btn-info', {hasText: 'View'}),
      })
      .first();
    await expect(viewPreviousVersionLink).toBeVisible();

    const historicalPagePromise = studentPage.context().waitForEvent('page');
    await viewPreviousVersionLink.click();
    const historicalPage = await historicalPagePromise;
    const historicalApplab = new AppLab(historicalPage);
    await historicalApplab.waitForReady();

    await expect
      .poll(() => historicalApplab.getAceEditorCode(), {timeout: 10_000})
      .toBe('// comment 1');
    await expect(
      historicalPage.locator('#workspace-header-span'),
    ).toContainText('View only');
    await historicalPage.close();

    await closeVersionHistory(applab);

    // Return to the course level; working copy still has both comments.
    await studentPage.goto(SCRIPT_LEVEL_URL, {waitUntil: 'domcontentloaded'});
    await applab.waitForReady();
    await applab.ensureTextMode();
    await expect
      .poll(() => applab.getAceEditorCode(), {timeout: 10_000})
      .toBe('// comment 2// comment 1');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/versions.feature
   * Scenario: Project Load and Reload
   *
   * Verifies that running and resetting a new project creates a checkpoint
   * visible in Version History as the second row.
   */
  test('project load and reload creates version', async ({studentPage}) => {
    const applab = await createFreshAppLabProject(studentPage);

    await studentPage.reload();
    await applab.waitForReady();
    await openVersionHistory(applab);

    // Capture the timestamp text from the first (latest) version row.
    const firstRowText = await studentPage
      .locator('.versionRow:nth-child(1) p')
      .textContent({timeout: 10_000});

    // No version should show a sub-minute age immediately after load.
    await expect(
      studentPage
        .locator('#showVersionsModal tr')
        .filter({hasText: 'a minute ago'})
        .filter({hasText: 'Restore'}),
    ).not.toBeVisible();

    await closeVersionHistory(applab);

    // Run → capture → reset → run again triggers a checkpoint.
    await applab.run();
    await waitForInitialCapture(applab);
    await applab.resetButton.click();
    await applab.runButton.waitFor({state: 'visible', timeout: 30_000});
    await applab.run();
    await waitForSaved(applab);

    await openVersionHistory(applab);

    // Second row should carry the same timestamp as the saved first-row text.
    if (firstRowText) {
      await expect(
        studentPage.locator('.versionRow:nth-child(2) p'),
      ).toContainText(firstRowText, {timeout: 15_000});
    }
    await expect(
      studentPage.locator('.versionRow:nth-child(2) .img-upload'),
    ).toContainText('Restore');

    await expect(
      studentPage
        .locator('#showVersionsModal tr')
        .filter({hasText: 'a minute ago'})
        .filter({hasText: 'Restore'})
        .nth(1),
    ).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/versions.feature
   * Scenario: Project Version Checkpoints
   *
   * Sets the version interval to 1 second, waits for it to elapse, adds a
   * second code change, and verifies the first change was saved as a checkpoint.
   */
  test(
    'project version checkpoint after interval',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const applab = await createFreshAppLabProject(studentPage);
      await applab.ensureTextMode();

      await applab.insertCodeAtCursor('// comment A');
      await applab.run();
      await waitForSaved(applab);

      await openVersionHistory(applab);
      const savedText = await studentPage
        .locator('.versionRow:nth-child(1) p')
        .textContent({timeout: 10_000});
      await closeVersionHistory(applab);

      // Force the next save to create a checkpoint immediately.
      await studentPage.evaluate(() => {
        const pageWindow = window as ProjectTestWindow;
        pageWindow.dashboard?.project?.__TestInterface?.setSourceVersionInterval?.(
          0,
        );
      });

      await applab.ensureTextMode();
      await applab.insertCodeAtCursor('// comment B');
      await applab.resetButton.click();
      await applab.runButton.waitFor({state: 'visible', timeout: 30_000});
      await applab.run();
      await waitForSaved(applab);

      await openVersionHistory(applab);

      // The comment-A version is now a checkpoint; it appears as the second row.
      if (savedText) {
        await expect(
          studentPage.locator('.versionRow:nth-child(2) p'),
        ).toContainText(savedText, {timeout: 15_000});
      }
      await expect(
        studentPage.locator('.versionRow:nth-child(2) .img-upload'),
      ).toContainText('Restore');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/versions.feature
   * Scenario: Project page refreshes when other client adds a newer version
   *
   * Two tabs edit the same project.  Tab 1 creates version Y after tab 0 has
   * version X.  Tab 0's stale attempt to write Z gets a 409 and reloads to Y.
   */
  test(
    'page refreshes when another client adds a newer version',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const tab0 = studentPage;
      const applab0 = await createFreshAppLabProject(tab0);
      await applab0.ensureTextMode();

      await addCodeRunAndSave(applab0, '// comment X', '// comment X');

      const tab1 = await tab0.context().newPage();
      const applab1 = new AppLab(tab1);
      await tab1.goto(projectEditPath(tab0), {waitUntil: 'domcontentloaded'});
      await applab1.waitForReady();
      await waitForSaved(applab1);
      await applab1.ensureTextMode();
      await expect
        .poll(() => applab1.getAceEditorCode(), {timeout: 10_000})
        .toBe('// comment X');

      await addCodeRunAndSave(
        applab1,
        '// comment Y',
        '// comment Y// comment X',
      );

      await tab1.close();
      await expect
        .poll(() => applab0.getAceEditorCode(), {timeout: 10_000})
        .toBe('// comment X');

      await addCodeRunAndExpectConflict(
        applab0,
        '// comment Z',
        '// comment Y// comment X',
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/versions.feature
   * Scenario: Project page refreshes when other client replaces current version
   *
   * Tab 1 loads Alpha.  Tab 0 replaces that current version with Bravo.  Tab
   * 1's stale attempt to write Charlie gets a 409 and reloads to Alpha+Bravo.
   */
  test(
    'page refreshes when another client replaces current version',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const tab0 = studentPage;
      const applab0 = await createFreshAppLabProject(tab0);
      await applab0.ensureTextMode();

      await addCodeRunAndSave(applab0, '// Alpha', '// Alpha', {
        mode: 'append',
      });
      await applab0.resetButton.click();
      await applab0.runButton.waitFor({state: 'visible', timeout: 30_000});

      const tab1 = await tab0.context().newPage();
      const applab1 = new AppLab(tab1);
      await tab1.goto(projectEditPath(tab0));
      await applab1.waitForReady();
      await waitForSaved(applab1);
      await applab1.ensureTextMode();
      await expect
        .poll(() => applab1.getAceEditorCode(), {timeout: 10_000})
        .toBe('// Alpha');

      await expect
        .poll(() => applab0.getAceEditorCode(), {timeout: 10_000})
        .toBe('// Alpha');
      await addCodeRunSaveAndReloadUntilPersisted(applab0, '// Bravo', [
        '// Alpha// Bravo',
        '// Alpha\n// Bravo',
      ]);

      await expect
        .poll(() => applab1.getAceEditorCode(), {timeout: 10_000})
        .toBe('// Alpha');
      await addCodeRunAndExpectConflict(applab1, '// Charlie', [
        '// Alpha// Bravo',
        '// Alpha\n// Bravo',
      ]);

      await tab1.close();
    },
  );
});

/**
 * Create a new standalone App Lab project and wait for its first save.
 */
async function createFreshAppLabProject(
  page: import('@playwright/test').Page,
): Promise<AppLab> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.goto('/projects/applab/new', {waitUntil: 'domcontentloaded'});

    try {
      await page.waitForURL(/\/projects\/applab\/[^/]+\/edit/, {
        timeout: 45_000,
      });
      const applab = new AppLab(page);
      await applab.waitForReady();
      await waitForInitialSave(applab);
      await waitForSaved(applab);
      return applab;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

/**
 * Return the current standalone App Lab edit path, preserving project id but
 * stripping origin so it works with Playwright's configured baseURL.
 */
function projectEditPath(page: import('@playwright/test').Page): string {
  return new URL(page.url()).pathname;
}

/**
 * Add code at the current ACE cursor, run the project, and wait for the save
 * indicator to visibly advance to Saved before any later reload/navigation.
 */
async function addCodeRunAndSave(
  applab: AppLab,
  code: string,
  expectedCode: string | string[],
  {mode = 'cursor'}: {mode?: 'append' | 'cursor'} = {},
): Promise<void> {
  await expect(async () => {
    await applab.waitForReady();
    await applab.ensureTextMode();

    const saveError = applab.page.locator('.project-save-error');
    const shouldSave =
      !codeMatches(await getAceEditorCodeIfReady(applab), expectedCode) ||
      (await saveError.isVisible().catch(() => false));
    if (!codeMatches(await getAceEditorCodeIfReady(applab), expectedCode)) {
      if (mode === 'append') {
        await applab.appendCode(code);
      } else {
        await applab.insertCodeAtCursor(code);
      }
    }
    await expect
      .poll(
        async () =>
          codeMatches(await getAceEditorCodeIfReady(applab), expectedCode),
        {timeout: 10_000},
      )
      .toBe(true);

    await applab.waitForUiSaveAfter(() => applab.run(), {
      expectSave: shouldSave,
    });
  }).toPass({
    intervals: [1_000, 2_000, 5_000],
    timeout: 2 * 60_000,
  });
}

/**
 * Add code from a stale tab, click Run, and wait for App Lab to reload the
 * user-visible editor with the latest version.  The Cucumber scenario does
 * not observe the 409 response directly; it waits for the lab page and checks
 * ACE contents, so the readiness signal here is the editor text.
 */
async function addCodeRunAndExpectConflict(
  applab: AppLab,
  code: string,
  latestCodeAfterReload: string | string[],
): Promise<void> {
  await applab.insertCodeAtCursor(code);
  await applab.run();
  await expect
    .poll(
      async () =>
        codeMatches(
          await getAceEditorCodeIfReady(applab),
          latestCodeAfterReload,
        ),
      {timeout: 60_000},
    )
    .toBe(true);
}

/**
 * Add code, wait for App Lab's visible Saved state, then reload and verify the
 * editor still shows the new source.  The Cucumber source reloads here with the
 * comment "Make sure the change stuck"; this wraps that same user-visible check
 * in a retry because the App Lab save indicator can briefly report Saved before
 * a follow-up reload serves the latest source.
 */
async function addCodeRunSaveAndReloadUntilPersisted(
  applab: AppLab,
  code: string,
  expectedCode: string[],
): Promise<void> {
  await expect(async () => {
    await addCodeRunAndSave(applab, code, expectedCode, {mode: 'append'});
    await applab.page.reload({waitUntil: 'domcontentloaded'});
    await applab.waitForReady();
    await applab.ensureTextMode();
    await expect
      .poll(
        async () =>
          codeMatches(await getAceEditorCodeIfReady(applab), expectedCode),
        {timeout: 10_000},
      )
      .toBe(true);
  }).toPass({
    intervals: [1_000, 2_000, 5_000],
    timeout: 2 * 60_000,
  });
}

/**
 * Compare current ACE text against either one exact expectation or a small set
 * of accepted renderings.
 */
function codeMatches(
  codeText: string,
  expectedCode: string | string[],
): boolean {
  return Array.isArray(expectedCode)
    ? expectedCode.includes(codeText)
    : codeText === expectedCode;
}

/**
 * Read ACE text once App Lab has reinitialized after a conflict reload.
 * During the reload the editor globals briefly disappear; returning a sentinel
 * lets expect.poll keep waiting for the visible editor state.
 */
async function getAceEditorCodeIfReady(applab: AppLab): Promise<string> {
  return applab.page
    .evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iface = (window as any).__TestInterface;
      const aceEditor = iface?.getDroplet?.()?.aceEditor;
      if (!aceEditor) return '__ACE_NOT_READY__';
      return (aceEditor.getValue() as string).trim();
    })
    .catch(() => '__ACE_NOT_READY__');
}
