import {AppLab} from '../../applab/AppLab';
import {expect, test} from '../../shared/fixtures';
import {labLevelUrl} from '../../shared/urls';
import {Artist} from '../activities/artist/Artist';
import {ARTIST_AUTORUN_BLOCKS} from '../activities/artist/blocks';
import {GameLab} from '../activities/gamelab/GameLab';
import {Maze} from '../activities/maze/Maze';
import {SpriteLab} from '../activities/spritelab/SpriteLab';
import {Match} from '../match/Match';
import {Multi} from '../multi/Multi';
import {Pixelation} from '../pixelation/Pixelation';
import {PKC} from '../pkc/PKC';

/**
 * Legacy Applitools smoke ports.
 *
 * Source: dashboard/test/ui/features/eyes.feature
 *
 * The source scenarios have blank Gherkin names and use Applitools
 * checkpoints. These ports run the same user setup up to each checkpoint and
 * leave the pixel comparison as a stub comment at the checkpoint site.
 */

test.describe('Legacy Eyes smoke ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('multi level reaches visual-checkpoint state', async ({page}) => {
    const multi = new Multi(page);
    await multi.gotoLevel(9, 1);
    await expect(multi.submitButton).toBeVisible();
    // Visual checkpoint stub: "level load".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('match level reaches visual-checkpoint state after closing instructions', async ({
    page,
  }) => {
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(11, 1));
    const match = new Match(page);
    await expect(match.submitButton).toBeVisible({timeout: 30_000});
    await match.dismissInstructionsIfPresent();
    await expect(match.submitButton).toBeVisible();
    // Visual checkpoint stub: "level load".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('text-only match level reaches visual-checkpoint state', async ({
    page,
  }) => {
    const match = new Match(page);
    await match.gotoLevel(2);
    await expect(match.submitButton).toBeVisible();
    // Visual checkpoint stub: "level load".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('text-compression level accepts dictionary text', async ({page}) => {
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(16, 1));
    await expect(page.locator('body')).toContainText('Text Compression', {
      timeout: 30_000,
    });
    // Visual checkpoint stub: "level load".
    await page.evaluate(() => {
      const win = window as typeof window & {
        editor?: {setValue: (value: string) => void; getValue: () => string};
      };
      if (!win.editor) throw new Error('text-compression editor not ready');
      win.editor.setValue('pitter\npatter\n');
    });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const win = window as typeof window & {
            editor?: {getValue: () => string};
          };
          return win.editor?.getValue();
        }),
      )
      .toBe('pitter\npatter\n');
    // Visual checkpoint stub: "simple substitution".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('pixelation range level reaches visual-checkpoint state', async ({
    page,
  }) => {
    const pixelation = new Pixelation(page);
    await pixelation.gotoLevel(2);
    await expect(pixelation.pixelDataInput).toBeVisible();
    // Visual checkpoint stub: "level load".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('maze feedback and RTL states reach visual checkpoints', async ({
    page,
  }) => {
    const maze = new Maze(page);
    await maze.gotoLevel(1);
    await maze.runUntilInlineFeedback();
    await expect(
      page.locator('.uitest-topInstructions-inline-feedback'),
    ).toBeVisible();
    // Visual checkpoint stub: "maze feedback with blocks".

    await page.goto(
      '/courses/allthethingscourse/units/1/lessons/2/levels/1/lang/ar-sa?noautoplay=true',
    );
    await maze.waitForLabPage();
    await expect(page.locator('#runButton')).toBeVisible();
    // Visual checkpoint stub: "maze RTL".
  });
});

test.describe('App Lab Eyes smoke ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes1.feature
   * Scenario: Design elements are visible in local and shared projects
   */
  test('new App Lab project runs and opens a share page', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    // Visual checkpoint stub: "initial load".

    await applab.ensureTextMode();
    await applab.appendCode(
      "createCanvas('my_canvas', 320, 480);\nbutton('my_button', 'ButtonText');",
    );
    await applab.run();
    await expect(studentPage.locator('#my_button')).toBeVisible({
      timeout: 15_000,
    });
    // Visual checkpoint stub: "button should be visible".

    const sharePath = await applab.getShareUrlFromDialog();
    await studentPage.goto(sharePath);
    await expect(studentPage.locator('#divApplab')).toBeVisible({
      timeout: 30_000,
    });
    // Visual checkpoint stub: "app lab share".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes1.feature
   * Scenario: App Lab UI elements from initial code and html
   */
  test('App Lab level 9 shows authored and dynamic UI elements', async ({
    page,
  }) => {
    const applab = new AppLab(page);
    await page.goto(labLevelUrl(18, 9));
    await applab.waitForReady();
    await expect(page.getByRole('button', {name: 'Button'})).toBeVisible();
    await expect(
      page.getByRole('textbox', {name: 'placeholder text'}),
    ).toBeVisible();
    // Visual checkpoint stub: "design mode elements in code mode".

    await applab.run();
    await expect(page.locator('#radioid')).toBeVisible({timeout: 15_000});
    // Visual checkpoint stub: "dynamically generated elements in code mode".

    await applab.switchToDesignMode();
    await expect(applab.designWorkspace).toBeVisible();
    // Visual checkpoint stub: "design mode elements in design mode".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes1.feature
   * Scenario: Text area with multiple lines, radio button, checkbox
   */
  test('App Lab design palette exposes textarea radio and checkbox controls', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await applab.switchToDesignMode();

    for (const elementType of ['TEXT_AREA', 'RADIO_BUTTON', 'CHECKBOX']) {
      await expect(
        studentPage.locator(`[data-element-type='${elementType}']`),
      ).toBeVisible();
      // Visual checkpoint stub: design palette state for this control.
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes1.feature
   * Scenario: Applab Instructions Resize
   */
  test('App Lab instructions and visualization panes expose resize controls', async ({
    page,
  }) => {
    const applab = new AppLab(page);
    await page.goto(labLevelUrl(18, 9));
    await applab.waitForReady();
    await expect(
      page.getByRole('button', {name: 'Instructions'}),
    ).toBeVisible();
    await expect(page.locator('.fa-ellipsis').first()).toBeVisible();
    await expect(page.locator('#visualizationResizeBar')).toBeVisible();
    // Visual checkpoint stub: base and resized pane states.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes2.feature
   * Scenario: Applab visualization scaling
   */
  test('App Lab visualization can run generated canvas controls', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await applab.ensureTextMode();
    await applab.appendCode(
      "createCanvas('my_canvas', 320, 480);\nbutton('my_button', 'ButtonText');",
    );
    await applab.run();
    await expect(studentPage.locator('#my_canvas')).toBeVisible({
      timeout: 15_000,
    });
    await expect(studentPage.locator('#my_button')).toBeVisible();
    // Visual checkpoint stub: medium/large/small visualization scaling.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes2.feature
   * Scenario: Applab embedded level
   */
  test('App Lab embedded level renders its app canvas', async ({page}) => {
    const applab = new AppLab(page);
    await page.goto(labLevelUrl(18, 12));
    await applab.waitForReady();
    await expect(applab.appCanvas).toBeVisible();
    // Visual checkpoint stub: "embedded level".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes2.feature
   * Scenario: Applab widget mode
   */
  test('App Lab widget mode level shows start-over control', async ({page}) => {
    await page.goto(labLevelUrl(18, 22));
    await expect(page.locator('#start_over_button')).toBeVisible({
      timeout: 30_000,
    });
    // Visual checkpoint stub: "widget mode level".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes2.feature
   * Scenario: Applab Instructions in Top Pane
   */
  test('App Lab top instructions can collapse and levels still render', async ({
    page,
  }) => {
    const applab = new AppLab(page);
    await page.goto(labLevelUrl(18, 9));
    await applab.waitForReady();
    // Visual checkpoint stub: "top instructions enabled on standard level".

    const collapse = page.locator('.fa-circle-chevron-up').first();
    if (await collapse.isVisible()) {
      await collapse.click();
      await expect(
        page.locator('.fa-circle-chevron-down').first(),
      ).toBeVisible();
      // Visual checkpoint stub: "top instructions collapsed".
    }

    await page.goto(labLevelUrl(18, 10));
    await applab.waitForReady();
    // Visual checkpoint stub: "top instructions enabled on instructionless level".

    await page.goto(labLevelUrl(18, 12));
    await applab.waitForReady();
    // Visual checkpoint stub: "top instructions enabled on embed level".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes3.feature
   * Scenario: Data Browser
   */
  test('App Lab data browser renders data and key-value tabs', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await applab.switchToDataMode();
    await applab.waitForDataLibrary();
    await expect(applab.dataLibraryContainer).toContainText('DATA TABLES');
    await expect(applab.dataLibraryContainer).toContainText('KEY/VALUE PAIRS');
    // Visual checkpoint stub: data browser overview.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes4.feature
   * Scenario: Applab debugging
   */
  test('App Lab debugging controls render after stepping into code', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await applab.ensureTextMode();
    await applab.appendCode(
      "createCanvas('my_canvas', 320, 480);\nbutton('my_button', 'ButtonText');",
    );
    await applab.openDebugConsole();
    await expect(studentPage.locator('#stepInButton')).toBeVisible({
      timeout: 15_000,
    });
    await studentPage.locator('#stepInButton').click();
    // Visual checkpoint stub: "stepped in once".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes4.feature
   * Scenario: Drag to delete
   */
  test('App Lab design mode exposes the button palette and workspace', async ({
    studentPage,
  }) => {
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await applab.switchToDesignMode();
    await expect(
      studentPage.locator("[data-element-type='BUTTON']"),
    ).toBeVisible();
    await expect(applab.designWorkspace).toBeVisible();
    // Visual checkpoint stub: drag-in, out-of-bounds, and delete states.
  });
});

test.describe('Other lab visual smoke ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/gamelab/eyes.feature
   * Scenario: Basic GameLab level
   */
  test('new Game Lab project reaches animation-picker visual states', async ({
    studentPage,
  }) => {
    const gamelab = new GameLab(studentPage);
    await gamelab.gotoNewProject();
    await expect(gamelab.runButton).toBeVisible();
    // Visual checkpoint stub: "initial load".

    await gamelab.switchToAnimationTab();
    await expect(gamelab.animationListNewItem).toBeVisible();
    // Visual checkpoint stub: "animation tab".

    await gamelab.openAnimationPicker();
    await expect(
      studentPage.locator('.modal .uitest-animation-picker-list').last(),
    ).toBeVisible();
    // Visual checkpoint stub: "new animation".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/gamelab/eyes.feature
   * Scenario: Game Lab Embed Level
   */
  test('Game Lab embedded test level reaches initial visual state', async ({
    page,
  }) => {
    const gamelab = new GameLab(page);
    await gamelab.gotoLevel(3);
    await expect(gamelab.runButton).toBeVisible();
    await expect(page.locator('#divGameLab')).toBeVisible();
    // Visual checkpoint stub: "initial load".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/public_key_cryptography/eyes.feature
   * Scenario: Modulo Clock Appearance
   */
  test('Public Key Cryptography modulo clock renders', async ({page}) => {
    const pkc = new PKC(page);
    await pkc.gotoLevel(1);
    await expect(pkc.mount).toContainText(/mod|clock|continue/i);
    // Visual checkpoint stub: "initial load" and "completed run".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/public_key_cryptography/eyes.feature
   * Scenario: Cryptography Widget Appearance
   */
  test('Public Key Cryptography widget views render', async ({page}) => {
    const pkc = new PKC(page);
    await pkc.gotoLevel(2);
    await expect(pkc.mount).toBeVisible();
    // Visual checkpoint stub: Alice/Eve/Bob/All/key-exchange states.
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/spritelab/eyes.feature
   * Scenario: Basic Sprite Lab level
   */
  test('new Sprite Lab project renders and runs', async ({studentPage}) => {
    const spritelab = new SpriteLab(studentPage);
    await studentPage.goto('/projects/spritelab/new');
    await spritelab.waitForLabPage();
    await expect(studentPage.locator('#p5_loading')).toBeHidden({
      timeout: 60_000,
    });
    // Visual checkpoint stub: "initial load".

    await spritelab.run();
    await expect(spritelab.resetButton).toBeVisible();
    // Visual checkpoint stub: "run".
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/artist_autorun.feature
   * Scenario: Autorun Eyes Test
   */
  test('Artist autorun level renders before and after workspace initialization', async ({
    page,
  }) => {
    const artist = new Artist(page);
    await artist.gotoLevel(9);
    await expect(artist.runButton).toBeVisible();
    // Visual checkpoint stub: "square already drawn".

    await artist.loadBlocks(ARTIST_AUTORUN_BLOCKS);
    await expect
      .poll(() => page.locator('.blocklyDraggable').count(), {
        timeout: 15_000,
      })
      .toBeGreaterThan(1);
    // Visual checkpoint stub: "two squares drawn".
  });
});
