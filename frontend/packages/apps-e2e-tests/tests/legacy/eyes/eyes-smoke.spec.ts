import type {Page} from '@playwright/test';

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

function mazeDynamicGridIgnoreRegions(page: Page) {
  return [page.locator('#visualization')];
}

/**
 * Legacy Applitools smoke ports.
 *
 * Source: dashboard/test/ui/features/eyes.feature
 *
 * The source scenarios have blank Gherkin names. These ports run the same
 * user setup as Cucumber up to each checkpoint and emit an `eyes.check(...)`
 * at the same site. The `eyes.open(...)` argument is the exact string from
 * the Cucumber `I open my eyes to test "X"` step so the Cucumber baselines
 * on the `test` branch can be reused without rebaselining.
 */

test.describe('Legacy Eyes smoke ports', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('multi level reaches visual-checkpoint state', async ({page, eyes}) => {
    await eyes.open('multi');
    const multi = new Multi(page);
    await multi.gotoLevel(9, 1);
    await expect(multi.submitButton).toBeVisible();
    await eyes.check('level load');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('match level reaches visual-checkpoint state after closing instructions', async ({
    page,
    eyes,
  }) => {
    await eyes.open('match');
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(11, 1));
    const match = new Match(page);
    await expect(match.submitButton).toBeVisible({timeout: 30_000});
    await match.dismissInstructionsIfPresent();
    await expect(match.submitButton).toBeVisible();
    await eyes.check('level load');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('text-only match level reaches visual-checkpoint state', async ({
    page,
    eyes,
  }) => {
    await eyes.open('text-only match');
    const match = new Match(page);
    await match.gotoLevel(2);
    await expect(match.submitButton).toBeVisible();
    await eyes.check('level load');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('text-compression level accepts dictionary text', async ({
    page,
    eyes,
  }) => {
    await eyes.open('text compression');
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(16, 1));
    await expect(page.locator('body')).toContainText('Text Compression', {
      timeout: 30_000,
    });
    await eyes.check('level load');
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
    await eyes.check('simple substitution');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('pixelation range level reaches visual-checkpoint state', async ({
    page,
    eyes,
  }) => {
    await eyes.open('pixelation with range');
    const pixelation = new Pixelation(page);
    await pixelation.gotoLevel(2);
    await expect(pixelation.pixelDataInput).toBeVisible();
    await eyes.check('level load');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/eyes.feature
   * Scenario:
   */
  test('maze feedback and RTL states reach visual checkpoints', async ({
    page,
    eyes,
  }) => {
    await eyes.open('maze');
    const maze = new Maze(page);
    await maze.gotoLevel(1);
    await maze.runUntilInlineFeedback({speedUp: false});
    await expect(
      page.locator('.uitest-topInstructions-inline-feedback'),
    ).toBeVisible();
    await eyes.check('maze feedback with blocks', {
      ignoreRegions: mazeDynamicGridIgnoreRegions(page),
    });

    await page.goto(
      '/courses/allthethingscourse/units/1/lessons/2/levels/1/lang/ar-sa?noautoplay=true',
    );
    await maze.waitForLabPage();
    await expect(page.locator('#runButton')).toBeVisible();
    await eyes.check('maze RTL', {
      ignoreRegions: mazeDynamicGridIgnoreRegions(page),
    });
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
    eyes,
  }) => {
    await eyes.open('applab eyes');
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await eyes.check('initial load');

    await applab.ensureTextMode();
    await applab.appendCode(
      "createCanvas('my_canvas', 320, 480);\nbutton('my_button', 'ButtonText');",
    );
    await applab.run();
    await expect(studentPage.locator('#my_button')).toBeVisible({
      timeout: 15_000,
    });
    await eyes.check('button should be visible');

    const sharePath = await applab.getShareUrlFromDialog();
    await studentPage.goto(sharePath);
    await expect(studentPage.locator('#divApplab')).toBeVisible({
      timeout: 30_000,
    });
    await eyes.check('app lab share');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes1.feature
   * Scenario: App Lab UI elements from initial code and html
   */
  test('App Lab level 9 shows authored and dynamic UI elements', async ({
    page,
    eyes,
  }) => {
    await eyes.open('App Lab UI Elements from initial code and html');
    const applab = new AppLab(page);
    await page.goto(labLevelUrl(18, 9));
    await applab.waitForReady();
    await expect(page.getByRole('button', {name: 'Button'})).toBeVisible();
    await expect(
      page.getByRole('textbox', {name: 'placeholder text'}),
    ).toBeVisible();
    await eyes.check('design mode elements in code mode');

    await applab.run();
    await expect(page.locator('#radioid')).toBeVisible({timeout: 15_000});
    await eyes.check('dynamically generated elements in code mode');

    await applab.switchToDesignMode();
    await expect(applab.designWorkspace).toBeVisible();
    await eyes.check('design mode elements in design mode');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes1.feature
   * Scenario: Text area with multiple lines, radio button, checkbox
   */
  test('App Lab design palette exposes textarea radio and checkbox controls', async ({
    studentPage,
    eyes,
  }) => {
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await applab.switchToDesignMode();
    await eyes.open('applab design mode');

    for (const elementType of ['TEXT_AREA', 'RADIO_BUTTON', 'CHECKBOX']) {
      await expect(
        studentPage.locator(`[data-element-type='${elementType}']`),
      ).toBeVisible();
      await eyes.check(`${elementType.toLowerCase()} palette visible`, {
        ignoreRegions: [studentPage.locator('.project_updated_at')],
      });
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes1.feature
   * Scenario: Applab Instructions Resize
   */
  test('App Lab instructions and visualization panes expose resize controls', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Applab instructions resize');
    const applab = new AppLab(page);
    await page.goto(labLevelUrl(18, 9));
    await applab.waitForReady();
    await expect(
      page.getByRole('button', {name: 'Instructions'}),
    ).toBeVisible();
    await expect(page.locator('.fa-ellipsis').first()).toBeVisible();
    await expect(page.locator('#visualizationResizeBar')).toBeVisible();
    await eyes.check('base case');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes2.feature
   * Scenario: Applab visualization scaling
   */
  test('App Lab visualization can run generated canvas controls', async ({
    studentPage,
    eyes,
  }) => {
    await eyes.open('Applab visualization scaling');
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
    await eyes.check('medium scaling');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes2.feature
   * Scenario: Applab embedded level
   */
  test('App Lab embedded level renders its app canvas', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Applab embedded level');
    const applab = new AppLab(page);
    await page.goto(labLevelUrl(18, 12));
    await applab.waitForReady();
    await expect(applab.appCanvas).toBeVisible();
    await eyes.check('embedded level');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes2.feature
   * Scenario: Applab widget mode
   */
  test('App Lab widget mode level shows start-over control', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Applab widget mode');
    await page.goto(labLevelUrl(18, 22));
    await expect(page.locator('#start_over_button')).toBeVisible({
      timeout: 30_000,
    });
    await eyes.check('widget mode level');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes2.feature
   * Scenario: Applab Instructions in Top Pane
   */
  test('App Lab top instructions can collapse and levels still render', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Applab Instructions in top pane');
    const applab = new AppLab(page);
    await page.goto(labLevelUrl(18, 9));
    await applab.waitForReady();
    await eyes.check('top instructions enabled on standard level');

    const collapse = page.locator('.fa-circle-chevron-up').first();
    if (await collapse.isVisible()) {
      await collapse.click();
      await expect(
        page.locator('.fa-circle-chevron-down').first(),
      ).toBeVisible();
      await eyes.check('top instructions collapsed');
    }

    await page.goto(labLevelUrl(18, 10));
    await applab.waitForReady();
    await eyes.check('top instructions enabled on instructionless level');

    await page.goto(labLevelUrl(18, 12));
    await applab.waitForReady();
    await eyes.check('top instructions enabled on embed level');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes3.feature
   * Scenario: Data Browser
   */
  test('App Lab data browser renders data and key-value tabs', async ({
    studentPage,
    eyes,
  }) => {
    await eyes.open('Applab Data Browser');
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await applab.switchToDataMode();
    await applab.waitForDataLibrary();
    await expect(applab.dataLibraryContainer).toContainText('DATA TABLES');
    await expect(applab.dataLibraryContainer).toContainText('KEY/VALUE PAIRS');
    await eyes.check('data overview');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes4.feature
   * Scenario: Applab debugging
   */
  test('App Lab debugging controls render after stepping into code', async ({
    studentPage,
    eyes,
  }) => {
    await eyes.open('Applab debugging');
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
    await eyes.check('stepped in once');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/applab/eyes4.feature
   * Scenario: Drag to delete
   */
  test('App Lab design mode exposes the button palette and workspace', async ({
    studentPage,
    eyes,
  }) => {
    await eyes.open('Drag to delete');
    const applab = new AppLab(studentPage);
    await studentPage.goto('/projects/applab/new');
    await applab.waitForReady();
    await applab.switchToDesignMode();
    await expect(
      studentPage.locator("[data-element-type='BUTTON']"),
    ).toBeVisible();
    await expect(applab.designWorkspace).toBeVisible();
    await eyes.check('button palette and workspace visible');
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
    eyes,
  }) => {
    await eyes.open('gamelab eyes');
    const gamelab = new GameLab(studentPage);
    await gamelab.gotoNewProject();
    await expect(gamelab.runButton).toBeVisible();
    await eyes.check('initial load');

    await gamelab.switchToAnimationTab();
    await expect(gamelab.animationListNewItem).toBeVisible();
    await eyes.check('animation tab');

    await gamelab.openAnimationPicker();
    await expect(
      studentPage.locator('.modal .uitest-animation-picker-list').last(),
    ).toBeVisible();
    await eyes.check('new animation');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/gamelab/eyes.feature
   * Scenario: Game Lab Embed Level
   */
  test('Game Lab embedded test level reaches initial visual state', async ({
    page,
    eyes,
  }) => {
    await eyes.open('Game Lab Embed Level');
    const gamelab = new GameLab(page);
    await gamelab.gotoLevel(3);
    await expect(gamelab.runButton).toBeVisible();
    await expect(page.locator('#divGameLab')).toBeVisible();
    await eyes.check('initial load');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/public_key_cryptography/eyes.feature
   * Scenario: Modulo Clock Appearance
   */
  test('Public Key Cryptography modulo clock renders', async ({page, eyes}) => {
    await eyes.open('Modulo Clock Appearance');
    const pkc = new PKC(page);
    await pkc.gotoLevel(1);
    await expect(pkc.mount).toContainText(/mod|clock|continue/i);
    await eyes.check('initial load');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/public_key_cryptography/eyes.feature
   * Scenario: Cryptography Widget Appearance
   */
  test('Public Key Cryptography widget views render', async ({page, eyes}) => {
    await eyes.open('Cryptography Widget Appearance');
    const pkc = new PKC(page);
    await pkc.gotoLevel(2);
    await expect(pkc.mount).toBeVisible();
    await eyes.check('initial load');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/spritelab/eyes.feature
   * Scenario: Basic Sprite Lab level
   */
  test('new Sprite Lab project renders and runs', async ({
    studentPage,
    eyes,
  }) => {
    await eyes.open('sprite lab eyes');
    const spritelab = new SpriteLab(studentPage);
    await studentPage.goto('/projects/spritelab/new');
    await spritelab.waitForLabPage();
    await expect(studentPage.locator('#p5_loading')).toBeHidden({
      timeout: 60_000,
    });
    await eyes.check('initial load');

    await spritelab.run();
    await expect(spritelab.resetButton).toBeVisible();
    await eyes.check('run');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/artist_autorun.feature
   * Scenario: Autorun Eyes Test
   */
  test('Artist autorun level renders before and after workspace initialization', async ({
    page,
    eyes,
  }) => {
    await eyes.open('artist autorun');
    const artist = new Artist(page);
    await artist.gotoLevel(9);
    await expect(artist.runButton).toBeVisible();
    await eyes.check('square already drawn');

    await artist.loadBlocks(ARTIST_AUTORUN_BLOCKS);
    await expect
      .poll(() => page.locator('.blocklyDraggable').count(), {
        timeout: 15_000,
      })
      .toBeGreaterThan(1);
    await eyes.check('two squares drawn');
  });
});
