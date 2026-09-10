import {test, expect} from '@playwright/test';

import {requestWithCsrf} from '../tests/shared/api';
import {createUser, createStudent, resetSession} from '../tests/shared/auth';

import {docsScreenshot} from './helpers';

// Minimal shape of the Blockly API used by page.evaluate callbacks below.
interface DocsBlocklyConnection {
  connect(target: unknown): void;
}
interface DocsBlocklyBlock {
  type?: string;
  initSvg(): void;
  render(): void;
  previousConnection?: unknown;
  nextConnection?: DocsBlocklyConnection;
}
interface DocsBlocklyWorkspace {
  getTopBlocks(): DocsBlocklyBlock[];
  newBlock(type: string): DocsBlocklyBlock;
  getFlyout?(): DocsBlocklyWorkspace | undefined;
  flyout_?: DocsBlocklyWorkspace;
  getWorkspace?(): DocsBlocklyWorkspace | undefined;
}
interface DocsBlocklyWindow {
  Blockly?: {
    getMainWorkspace?(): DocsBlocklyWorkspace | undefined;
    mainBlockSpace?: DocsBlocklyWorkspace;
  };
}

async function enrollStudentInCourse(
  page: import('@playwright/test').Page,
  courseVersionId: number,
) {
  await page.goto('/');
  await createUser(page, {type: 'teacher', name: 'RefTeacher'});
  const sectionResp = await requestWithCsrf(
    page,
    'POST',
    '/dashboardapi/sections',
    {
      login_type: 'email',
      participant_type: 'student',
    },
  );
  expect(sectionResp.ok).toBe(true);
  const section = JSON.parse(sectionResp.body) as {code: string; id: number};
  const patchResp = await requestWithCsrf(
    page,
    'PATCH',
    `/dashboardapi/sections/${section.id}`,
    {
      course_version_id: courseVersionId,
    },
  );
  expect(patchResp.ok).toBe(true);
  await resetSession(page);
  await page.goto('/');
  await createStudent(page, {name: 'RefStudent', age: '16'});
  const joinResp = await requestWithCsrf(
    page,
    'POST',
    `/api/v1/sections/${section.code}/join`,
  );
  expect(joinResp.ok).toBe(true);
}

async function dismissOverlays(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    document
      .querySelectorAll('.qtip, .cdo-callout, [class*="callout"]')
      .forEach(el => el.remove());
  });
  const okButton = page.locator('button:has-text("OK")');
  if (await okButton.isVisible({timeout: 2000}).catch(() => false)) {
    await okButton.click();
  }
  const overlay = page.locator('#overlay');
  if (await overlay.isVisible({timeout: 1000}).catch(() => false)) {
    await overlay.click();
  }
  await page.waitForTimeout(300);
}

// coursea-2024 cv=85, coursed-2024 cv=113, coursee-2024 cv=124, csd-2024 cv=565, csa-2024 cv=549

test.describe('Game Lab reference screenshots', () => {
  test('Game Lab workspace and regions', async ({page}) => {
    await page.goto('/');
    await createStudent(page, {name: 'GameLabStudent', age: '16'});
    await page.goto('/projects/gamelab/new');
    await expect(page.locator('#runButton')).toBeVisible({timeout: 60000});
    await dismissOverlays(page);

    // Inject a few lines of code so the workspace is not empty.
    await page.evaluate(() => {
      const studioApp = (
        window as unknown as {
          __TestInterface?: {
            studioApp?: {
              editor?: {
                aceEditor?: {setValue(value: string, cursor: number): void};
              };
            };
          };
        }
      ).__TestInterface?.studioApp;
      const aceEditor = studioApp?.editor?.aceEditor;
      if (aceEditor?.setValue) {
        aceEditor.setValue(
          [
            'var sprite = createSprite(200, 200, 50, 50);',
            'sprite.setAnimation("cat");',
            '',
            'function draw() {',
            '  background("white");',
            '  drawSprites();',
            '}',
          ].join('\n'),
          1,
        );
      }
    });
    await page.waitForTimeout(500);

    await docsScreenshot(page, 'guide/labs/game-lab.md', 'workspace');

    // Toolbox (Droplet palette with category tabs and block signatures).
    await docsScreenshot(page, 'guide/labs/game-lab.md', 'toolbox', {
      locator: page.locator('.droplet-palette-wrapper'),
    });

    // Canvas (visualization column includes Code/Animation toggle and preview).
    const vizCol = page.locator('#visualizationColumn');
    if (await vizCol.isVisible()) {
      await docsScreenshot(page, 'guide/labs/game-lab.md', 'canvas', {
        locator: vizCol,
      });
    }

    // Run button.
    await docsScreenshot(page, 'guide/labs/game-lab.md', 'run-button', {
      locator: page.locator('#runButton'),
    });

    // Reset button (after running).
    await page.locator('#runButton').click();
    await expect(page.locator('#resetButton')).toBeVisible({timeout: 10000});
    await docsScreenshot(page, 'guide/labs/game-lab.md', 'reset-button', {
      locator: page.locator('#resetButton'),
    });

    // Animation tab: open, add an animation from the library, close, then screenshot.
    const animBtn = page.locator('#animationMode').first();
    if (await animBtn.isVisible()) {
      await page
        .locator('#resetButton')
        .click()
        .catch(() => {});
      await page.waitForTimeout(500);
      await animBtn.click();
      await page.waitForTimeout(1000);
      // Click "new animation" to open the library picker.
      const newAnimBtn = page
        .locator(
          'button:has-text("new animation"), [class*="newAnimationButton"]',
        )
        .first();
      if (await newAnimBtn.isVisible({timeout: 3000}).catch(() => false)) {
        await newAnimBtn.click();
        await page.waitForTimeout(2000);
        // Click a category (Animals) then select the first animation.
        const animalsCategory = page.locator('text=Animals').first();
        if (
          await animalsCategory.isVisible({timeout: 3000}).catch(() => false)
        ) {
          await animalsCategory.click();
          await page.waitForTimeout(1000);
          const firstAnim = page
            .locator('[class*="animationPicker"] img:not([alt*="category"])')
            .first();
          if (await firstAnim.isVisible({timeout: 3000}).catch(() => false)) {
            await firstAnim.click();
            await page.waitForTimeout(1000);
          }
        }
        // Close the dialog if still open.
        const closeBtn = page
          .locator(
            '[class*="animationPicker"] button:has-text("Close"), [class*="modal"] .close',
          )
          .first();
        if (await closeBtn.isVisible({timeout: 2000}).catch(() => false)) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }
      await docsScreenshot(page, 'guide/labs/game-lab.md', 'animation-tab');
    }
  });
});

test.describe('Sprite Lab reference screenshots', () => {
  test('Sprite Lab workspace and regions', async ({page}) => {
    // coursee-2024 cv=124: lesson 3 level 7 (Fish Tank 5) has a category toolbox.
    await page.goto('/');
    await createUser(page, {type: 'teacher', name: 'SpriteTeacher'});
    const sr = await requestWithCsrf(page, 'POST', '/dashboardapi/sections', {
      login_type: 'email',
      participant_type: 'student',
    });
    expect(sr.ok).toBe(true);
    const sec = JSON.parse(sr.body) as {code: string; id: number};
    await requestWithCsrf(page, 'PATCH', `/dashboardapi/sections/${sec.id}`, {
      course_version_id: 124,
    });
    await resetSession(page);
    await page.goto('/');
    await createStudent(page, {name: 'SpriteStudent', age: '10'});
    await requestWithCsrf(page, 'POST', `/api/v1/sections/${sec.code}/join`);
    await page.goto('/s/coursee-2024/lessons/3/levels/7');
    await page.waitForSelector('#runButton', {timeout: 60000});
    await dismissOverlays(page);

    await docsScreenshot(page, 'guide/labs/sprite-lab.md', 'workspace');

    // Toolbox: click a category to open the flyout with blocks (before Run).
    const spritesCategory = page.locator(
      '.blocklyToolboxCategory:has-text("Sprites")',
    );
    if (await spritesCategory.isVisible()) {
      await spritesCategory.click();
      await page.waitForTimeout(500);
    }
    const flyout = page.locator('svg.blocklyFlyout');
    if (await flyout.first().isVisible()) {
      await docsScreenshot(page, 'guide/labs/sprite-lab.md', 'toolbox', {
        locator: flyout.first(),
      });
    }

    // Run button (before running).
    await docsScreenshot(page, 'guide/labs/sprite-lab.md', 'run-button', {
      locator: page.locator('#runButton'),
    });

    // Play area: run so sprites are visible, then screenshot.
    await page.locator('#runButton').click();
    await page.waitForTimeout(3000);
    await docsScreenshot(page, 'guide/labs/sprite-lab.md', 'play-area', {
      locator: page.locator('#visualization'),
    });
  });
});

test.describe('Web Lab reference screenshots', () => {
  test.beforeEach(async ({page}) => {
    await enrollStudentInCourse(page, 565);
  });
  test('Web Lab workspace and regions', async ({page}) => {
    await page.goto('/s/csd2-2024/lessons/2/levels/1');
    await page.waitForSelector(
      '.bramble-iframe, iframe[src*="bramble"], [class*="weblab"]',
      {timeout: 60000},
    );

    // Collapse instructions panel to reveal workspace regions.
    const collapseBtn = page
      .locator('.uitest-instructionsTab .hide-handle, [class*="collapser"]')
      .first();
    if (await collapseBtn.isVisible({timeout: 3000}).catch(() => false)) {
      await collapseBtn.click();
      await page.waitForTimeout(1000);
    }
    await dismissOverlays(page);

    await docsScreenshot(page, 'guide/labs/web-lab.md', 'workspace');

    // Bramble regions (file tree, editor, preview) are inside a cross-origin
    // iframe. Only outer controls are croppable.
    const versionBtn = page.locator('#versions-header');
    if (await versionBtn.isVisible()) {
      await docsScreenshot(
        page,
        'guide/labs/web-lab.md',
        'version-history-button',
        {
          locator: versionBtn,
        },
      );
    }
  });
});

test.describe('Java Lab reference screenshots', () => {
  test.beforeEach(async ({page}) => {
    await enrollStudentInCourse(page, 549);
  });
  test('Java Lab workspace and regions', async ({page}) => {
    await page.goto('/s/csa1-2024/lessons/3/levels/1');
    await page.waitForSelector('[class*="javalab"], .cm-editor, #codeTextbox', {
      timeout: 60000,
    });
    await dismissOverlays(page);

    await docsScreenshot(page, 'guide/labs/java-lab.md', 'workspace');

    // Editor tabs.
    const editorTabs = page.locator('#javalab-editor-tabs');
    if (await editorTabs.isVisible()) {
      await docsScreenshot(page, 'guide/labs/java-lab.md', 'editor-tabs', {
        locator: editorTabs,
      });
    }

    // Console: run the program to produce output if javabuilder is available.
    const runBtn = page.locator('#runButton');
    const isEnabled = await runBtn
      .isEnabled({timeout: 5000})
      .catch(() => false);
    if (isEnabled) {
      await runBtn.click();
      await page.waitForTimeout(5000);
    }
    const jConsole = page.locator('.javalab-console');
    if (await jConsole.isVisible()) {
      await docsScreenshot(page, 'guide/labs/java-lab.md', 'console', {
        locator: jConsole,
      });
    }

    // Backpack icon.
    const backpack = page.locator('#javalab-editor-backpack');
    if (await backpack.isVisible()) {
      await docsScreenshot(page, 'guide/labs/java-lab.md', 'backpack', {
        locator: backpack,
      });
    }

    // Run button: reset first if we ran above, then capture.
    const resetBtn = page.locator('#resetButton, button:has-text("Stop")');
    if (
      await resetBtn
        .first()
        .isVisible({timeout: 2000})
        .catch(() => false)
    ) {
      await resetBtn.first().click();
      await page.waitForTimeout(1000);
    }
    const javaRunBtn = page.locator('#runButton');
    if (await javaRunBtn.isVisible()) {
      await docsScreenshot(page, 'guide/labs/java-lab.md', 'run-button', {
        locator: javaRunBtn,
      });
    }
  });
});

test.describe('Music Lab reference screenshots', () => {
  test.beforeEach(async ({page}) => {
    await enrollStudentInCourse(page, 113);
  });
  test('Music Lab workspace and regions', async ({page}) => {
    // Try the freeplay level for a richer workspace.
    await page.goto('/s/coursed-2024/lessons/9/levels/16');
    // Music Lab is lab2/React; wait for a lab2 element or the Blockly div.
    await page.waitForSelector(
      '#blockly-div, [class*="music"], [id*="controls"]',
      {timeout: 60000},
    );
    await page.waitForTimeout(3000);
    await dismissOverlays(page);

    // Open the Sounds category to populate the toolbox flyout.
    // Lab2 Blockly uses different selectors than legacy Blockly.
    const soundsCategory = page
      .locator(
        '.blocklyToolboxCategory:has-text("Sounds"), ' +
          '.blocklyTreeRow:has-text("Sounds"), ' +
          '[class*="toolbox"] [role="treeitem"]:has-text("Sounds"), ' +
          'text:has-text("Sounds")',
      )
      .first();
    if (await soundsCategory.isVisible({timeout: 3000}).catch(() => false)) {
      await soundsCategory.click();
      await page.waitForTimeout(1000);
    }

    // Add a sound block via Blockly API for a realistic workspace and timeline.
    await page.evaluate(() => {
      const Blockly = (window as unknown as DocsBlocklyWindow).Blockly;
      if (!Blockly) return;
      const workspace = Blockly.getMainWorkspace?.() || Blockly.mainBlockSpace;
      if (!workspace) return;
      const whenRun = workspace.getTopBlocks()?.[0];
      if (!whenRun) return;
      // Try to find a sound block type.
      const soundTypes = [
        'music_play_sound_at_current_location_simple2',
        'music_play_sound',
        'music_playSound',
      ];
      for (const type of soundTypes) {
        try {
          const block = workspace.newBlock(type);
          block.initSvg();
          block.render();
          if (whenRun.nextConnection && block.previousConnection) {
            whenRun.nextConnection.connect(block.previousConnection);
          }
          break;
        } catch {
          /* type not available */
        }
      }
    });
    await page.waitForTimeout(500);

    await docsScreenshot(page, 'guide/labs/music-lab.md', 'workspace');

    // Toolbox: capture the flyout if open, otherwise capture the category list.
    const musicFlyout = page.locator('svg.blocklyFlyout, .blocklyFlyout');
    if (
      await musicFlyout
        .first()
        .isVisible({timeout: 2000})
        .catch(() => false)
    ) {
      await docsScreenshot(page, 'guide/labs/music-lab.md', 'toolbox', {
        locator: musicFlyout.first(),
      });
    } else {
      // Fallback: capture the whole toolbox div.
      const toolboxDiv = page
        .locator('.blocklyToolboxDiv, [class*="toolbox"]')
        .first();
      if (await toolboxDiv.isVisible({timeout: 2000}).catch(() => false)) {
        await docsScreenshot(page, 'guide/labs/music-lab.md', 'toolbox', {
          locator: toolboxDiv,
        });
      }
    }

    // Run to populate the timeline with sound visualization.
    await page.locator('#runButton, [id*="play"]').first().click();
    await page.waitForTimeout(3000);

    // Timeline area.
    const timeline = page
      .locator('#timeline-area, [class*="timeline"]')
      .first();
    if (await timeline.isVisible({timeout: 3000}).catch(() => false)) {
      await docsScreenshot(page, 'guide/labs/music-lab.md', 'timeline', {
        locator: timeline,
      });
    }

    // Playback controls.
    const controls = page.locator('#controls, [class*="controls"]').first();
    if (await controls.isVisible({timeout: 2000}).catch(() => false)) {
      await docsScreenshot(
        page,
        'guide/labs/music-lab.md',
        'playback-controls',
        {
          locator: controls,
        },
      );
    }
  });
});

test.describe('Dance Party reference screenshots', () => {
  test.beforeEach(async ({page}) => {
    await enrollStudentInCourse(page, 113);
  });
  test('Dance Party workspace and regions', async ({page}) => {
    // Level 15 has 27 blocks with categories (World, Dancers, Properties).
    await page.goto('/s/coursed-2024/lessons/8/levels/15');
    await page.waitForSelector('#runButton', {timeout: 60000});
    await dismissOverlays(page);

    await docsScreenshot(page, 'guide/labs/dance-party.md', 'workspace');

    // Stage: run first so dancer sprites are visible.
    await page.locator('#runButton').click();
    await page.waitForTimeout(3000);
    await docsScreenshot(page, 'guide/labs/dance-party.md', 'stage', {
      locator: page.locator('#visualization'),
    });
    await page.locator('#resetButton').click();
    await page.waitForTimeout(1000);

    // Song picker.
    const songPicker = page.locator('#song-selector-wrapper');
    if (await songPicker.isVisible()) {
      await docsScreenshot(page, 'guide/labs/dance-party.md', 'song-picker', {
        locator: songPicker,
      });
    }

    // Toolbox: click a category to open the flyout with blocks.
    const dancersCategory = page.locator(
      '.blocklyToolboxCategory:has-text("Dancers")',
    );
    if (await dancersCategory.isVisible()) {
      await dancersCategory.click();
      await page.waitForTimeout(500);
    }
    const danceFlyout = page.locator('svg.blocklyFlyout');
    if (await danceFlyout.first().isVisible()) {
      await docsScreenshot(page, 'guide/labs/dance-party.md', 'toolbox', {
        locator: danceFlyout.first(),
      });
    }

    // Run button.
    await docsScreenshot(page, 'guide/labs/dance-party.md', 'run-button', {
      locator: page.locator('#runButton'),
    });
  });
});

test.describe('Artist reference screenshots', () => {
  test.beforeEach(async ({page}) => {
    await enrollStudentInCourse(page, 85);
  });
  test('Artist workspace and regions', async ({page}) => {
    await page.goto('/s/coursea-2024/lessons/10/levels/2');
    await page.waitForSelector('#runButton', {timeout: 60000});
    await dismissOverlays(page);

    // Add blocks from the flyout for a realistic workspace.
    await page.evaluate(() => {
      const Blockly = (window as unknown as DocsBlocklyWindow).Blockly;
      if (!Blockly) return;
      const workspace = Blockly.mainBlockSpace || Blockly.getMainWorkspace?.();
      if (!workspace) return;
      const whenRun = workspace.getTopBlocks()?.[0];
      if (!whenRun) return;
      // Read available block types from the flyout.
      const flyout = workspace.getFlyout?.() || workspace.flyout_;
      if (!flyout) return;
      const flyoutBlocks = flyout.getWorkspace?.()?.getTopBlocks?.() || [];
      // Pick the first two connectable block types.
      let prev = whenRun;
      let added = 0;
      for (const fb of flyoutBlocks) {
        if (added >= 2) break;
        try {
          const block = workspace.newBlock(fb.type);
          block.initSvg();
          block.render();
          if (prev.nextConnection && block.previousConnection) {
            prev.nextConnection.connect(block.previousConnection);
            prev = block;
            added++;
          }
        } catch {
          /* block type not connectable */
        }
      }
    });
    await page.waitForTimeout(500);

    await docsScreenshot(page, 'guide/labs/artist.md', 'workspace');

    // Toolbox (Blockly flyout with direction blocks) -- before Run.
    const artistFlyout = page.locator('svg.blocklyFlyout');
    if (await artistFlyout.first().isVisible()) {
      await docsScreenshot(page, 'guide/labs/artist.md', 'toolbox', {
        locator: artistFlyout.first(),
      });
    }

    // Run button -- before Run.
    await docsScreenshot(page, 'guide/labs/artist.md', 'run-button', {
      locator: page.locator('#runButton'),
    });

    // Show Code button -- before Run.
    const showCode = page.locator('#show-code-header');
    if (await showCode.isVisible()) {
      await docsScreenshot(page, 'guide/labs/artist.md', 'show-code', {
        locator: showCode,
      });
    }

    // Canvas: run to show a drawn trail, then screenshot via clip
    // (the locator crop renders blank for canvas-backed elements).
    await page.locator('#runButton').click();
    await page.waitForTimeout(4000);
    const vizBox = await page.locator('#visualization').boundingBox();
    if (vizBox) {
      const outPath = (await import('node:path')).join(
        (await import('node:path')).resolve(__dirname, '..', '..', '..', '..'),
        'docs',
        'students',
        'labs',
        'images',
        'artist-canvas.png',
      );
      await page.screenshot({path: outPath, clip: vizBox});
    }
  });
});

test.describe('Maze reference screenshots', () => {
  test.beforeEach(async ({page}) => {
    await enrollStudentInCourse(page, 85);
  });
  test('Maze workspace and regions', async ({page}) => {
    await page.goto('/s/coursea-2024/lessons/4/levels/2');
    await page.waitForSelector('#runButton', {timeout: 60000});
    await dismissOverlays(page);

    await docsScreenshot(page, 'guide/labs/maze-and-puzzles.md', 'workspace');

    // Grid.
    await docsScreenshot(page, 'guide/labs/maze-and-puzzles.md', 'grid', {
      locator: page.locator('#visualization'),
    });

    // Toolbox (Blockly flyout with direction blocks).
    const mazeFlyout = page.locator('svg.blocklyFlyout');
    if (await mazeFlyout.first().isVisible()) {
      await docsScreenshot(page, 'guide/labs/maze-and-puzzles.md', 'toolbox', {
        locator: mazeFlyout.first(),
      });
    }

    // Run button.
    await docsScreenshot(page, 'guide/labs/maze-and-puzzles.md', 'run-button', {
      locator: page.locator('#runButton'),
    });

    // Feedback dialog: run the program and capture the result.
    await page.locator('#runButton').click();
    await page.waitForTimeout(3000);
    const feedbackDialog = page.locator(
      '.modal-content, .uitest-topInstructions-inline',
    );
    if (
      await feedbackDialog
        .first()
        .isVisible({timeout: 5000})
        .catch(() => false)
    ) {
      await docsScreenshot(
        page,
        'guide/labs/maze-and-puzzles.md',
        'feedback-dialog',
        {
          locator: feedbackDialog.first(),
        },
      );
    }
  });
});
