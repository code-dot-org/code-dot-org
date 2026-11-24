import {expect, type Locator, type Page} from '@playwright/test';

import {LessonLevelPage} from '../../pages/lesson-level-page';

/** The ui-test-spritelab-lab2 unit, one lesson, levels 1 to 10. */
export const SPRITELAB_LAB2_COURSE = 'ui-test-spritelab-lab2';

/**
 * Page object for Sprite Lab in Lab2 (apps/src/p5lab/spritelab/lab2).
 *
 * DOM contract:
 * - The editors sit in a group named "Edit" (EditorSwitch.tsx) with one
 *   button per editor: Images, World, Code.
 * - The Images tab is the outer region named "Images" (SpriteLab2View.tsx);
 *   its list, also a region named "Images" (ImageList.tsx), has the
 *   "New image" plus with a menu of kinds, word chips are
 *   buttons named by their word (WordMenus.tsx), and the rating is the
 *   "Good" and "Not so good" buttons (RatingBar.tsx).
 * - The World tab is the grid named "World" of gridcell buttons, with the
 *   radiogroup "Items to place" beside it (WorldTab.tsx).
 * - While the game plays it is the application named "Game playspace"
 *   (Playspace.tsx); the game hears the arrow keys on the window, wherever
 *   focus is.
 * - The checklist is a list whose items read "Done: " or "To do: " to
 *   assistive tech (lab2 ObjectivesList.tsx); Continue sits under it.
 */
export class SpriteLab2 extends LessonLevelPage {
  readonly editors: Locator;
  readonly imagesTab: Locator;
  readonly newImageButton: Locator;
  readonly generateButton: Locator;
  readonly animatedSwitch: Locator;
  readonly goodButton: Locator;
  readonly continueButton: Locator;
  readonly runButton: Locator;
  readonly stopButton: Locator;
  readonly worldGrid: Locator;
  readonly itemsToPlace: Locator;
  readonly game: Locator;
  readonly flyout: Locator;
  readonly workspace: Locator;

  constructor(page: Page) {
    super(page);
    this.editors = page.getByRole('group', {name: 'Edit'});
    // The list inside the Images pane is a region named "Images" too.
    this.imagesTab = page
      .getByRole('region', {name: 'Images', exact: true})
      .first();
    this.newImageButton = page.getByRole('button', {name: 'New image'});
    this.generateButton = page.getByRole('button', {name: /^Generate/});
    this.animatedSwitch = page.getByRole('checkbox', {name: 'Animated'});
    this.goodButton = page.getByRole('button', {name: 'Good', exact: true});
    this.continueButton = page.getByRole('button', {name: /^Continue/});
    // Ends in "Run": the preview's "Run this scene" and a scene level's
    // "Run scene" and "Run game" do not.
    this.runButton = page.getByRole('button', {name: /Run$/});
    this.stopButton = page.getByRole('button', {name: /Stop$/});
    this.worldGrid = page.getByRole('grid', {name: 'World'});
    this.itemsToPlace = page.getByRole('radiogroup', {name: 'Items to place'});
    this.game = page.getByRole('application', {name: 'Game playspace'});
    this.flyout = page.locator('.blocklyFlyout');
    this.workspace = page.locator('svg.blocklySvg g.blocklyWorkspace').first();
  }

  async gotoUnitLevel(level: number): Promise<void> {
    await this.gotoLevel({course: SPRITELAB_LAB2_COURSE, lesson: 1, level});
    await this.waitForReady();
  }

  /** The lab is up once its editor switch is on screen, or its game on a
      level that only plays. */
  async waitForReady(): Promise<void> {
    await expect(this.editors.or(this.game).first()).toBeVisible({
      timeout: 45_000,
    });
  }

  /**
   * Press Run and wait for the game to be running: the stop button shows
   * once the engine has taken the program, and the sprites load for a
   * moment after that before keys move anything.
   */
  async run(): Promise<void> {
    await this.runButton.click();
    await expect(this.stopButton).toBeVisible();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Hold one of the on-screen game controls (PlayBar.tsx: Left, Right,
   * Jump) for `ms`, for the one level that tests those controls. They send
   * the game the same key events as the keyboard (playBar.ts
   * dispatchGameKey).
   */
  async holdControl(label: string, ms: number): Promise<void> {
    const control = this.page.getByRole('button', {name: label, exact: true});
    const box = await control.boundingBox();
    if (!box) {
      throw new Error(`game control "${label}" is not on screen`);
    }
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.mouse.down();
    await this.page.waitForTimeout(ms);
    await this.page.mouse.up();
  }

  /**
   * Hold a control, in bursts, until the checklist item is done. The first
   * frames after Run can still be loading the sprites' pictures, during
   * which a press does nothing, as a student would find and press again.
   */
  async steerUntilDone(
    label: string,
    objective: string | RegExp,
  ): Promise<void> {
    for (let attempt = 0; attempt < 6; attempt++) {
      await this.holdControl(label, 2000);
      if ((await this.objective(objective).textContent())?.includes('Done:')) {
        return;
      }
    }
    await this.expectObjectiveDone(objective);
  }

  /**
   * Read through "How AI made your image", which a level that asks for it
   * opens once its first picture is ready, before showing it: Next to the
   * last panel, then Got it.
   */
  async readLearningStory(): Promise<void> {
    const story = this.page.getByRole('dialog', {
      name: 'How AI made your image',
    });
    await expect(story).toBeVisible();
    const gotIt = story.getByRole('button', {name: 'Got it'});
    while (!(await gotIt.isVisible())) {
      await story.getByRole('button', {name: 'Next'}).click();
    }
    await gotIt.click();
    await expect(story).toBeHidden();
  }

  /**
   * Hold `key` in the running game, jumping every half second when `jump`
   * is set, until the checklist item is done or 20 seconds pass. Clicking the game first moves focus onto it,
   * off any control that would also act on the keys.
   */
  async steerWithKeysUntilDone(
    objective: string | RegExp,
    {key = 'ArrowRight', jump = false}: {key?: string; jump?: boolean} = {},
  ): Promise<void> {
    await this.game.click();
    await this.page.keyboard.down(key);
    try {
      for (let tick = 0; tick < 40; tick++) {
        if (jump) {
          await this.page.keyboard.down('ArrowUp');
        }
        await this.page.waitForTimeout(250);
        if (jump) {
          await this.page.keyboard.up('ArrowUp');
        }
        await this.page.waitForTimeout(250);
        if (
          (await this.objective(objective).textContent())?.includes('Done:')
        ) {
          return;
        }
      }
    } finally {
      await this.page.keyboard.up(key);
    }
    await this.expectObjectiveDone(objective);
  }

  /** The first word offered in the sentence's first choice. */
  get firstWordChoice(): Locator {
    return this.page
      .getByRole('group', {name: /pick one/})
      .first()
      .getByRole('button')
      .first();
  }

  /** The student's `n`th picture among the items to place: "Sprite 1" is
      the player, "Sprite 2" the object, "Sprite 3" the friend. */
  spriteToPlace(n: number): Locator {
    return this.itemsToPlace.getByRole('radio', {name: `Sprite ${n}, sprite`});
  }

  get blockToPlace(): Locator {
    return this.itemsToPlace.getByRole('radio', {name: /block$/}).first();
  }

  /** A cell on the bottom row of the 10 by 10 grid, `column` counted from
      0: the row the player falls to from its start in column 1, so it walks
      into what sits there. */
  floorCell(column: number): Locator {
    return this.worldGrid.getByRole('gridcell').nth(90 + column);
  }

  async placeInWorld(item: Locator, cell: Locator): Promise<void> {
    await item.click();
    await cell.click();
  }

  editorButton(name: 'Images' | 'World' | 'Code'): Locator {
    return this.editors.getByRole('button', {name});
  }

  /** A word chip by its text, in the word menus. */
  word(text: string): Locator {
    return this.page.getByRole('button', {name: text, exact: true});
  }

  /** A checklist item, by a piece of its text. */
  objective(text: string | RegExp): Locator {
    return this.page.locator('li').filter({hasText: text});
  }

  async expectObjectiveDone(
    text: string | RegExp,
    options: {timeout?: number} = {},
  ): Promise<void> {
    await expect(this.objective(text)).toContainText('Done:', options);
  }

  /** A block in the toolbox flyout, by a piece of its text. */
  flyoutBlock(text: string): Locator {
    return this.flyout
      .locator('g.blocklyDraggable')
      .filter({hasText: text})
      .first();
  }

  /** The dashed outline a level leaves for the next block. */
  get placeholder(): Locator {
    return this.workspace.locator('.blocklyPlaceholder').first();
  }

  /**
   * Drag a flyout block so its top-left lands on `target`'s top-left:
   * Blockly then snaps its connection to the stack it was dropped on. The
   * pointer moves in steps, since Blockly starts a drag only past its drag
   * radius.
   */
  async dragFlyoutBlockTo(text: string, target: Locator): Promise<void> {
    // A level's outline is added after its blocks load.
    await expect(target).toBeVisible();
    const to = await target.boundingBox();
    if (!to) {
      throw new Error(`cannot drag "${text}": target not on screen`);
    }
    await this.dragFlyoutBlockToPoint(text, {x: to.x, y: to.y});
  }

  private async dragFlyoutBlockToPoint(
    text: string,
    to: {x: number; y: number},
  ): Promise<void> {
    const from = await this.flyoutBlock(text).boundingBox();
    if (!from) {
      throw new Error(`cannot drag "${text}": block not in the flyout`);
    }
    const grab = {x: from.x + 12, y: from.y + 12};
    await this.page.mouse.move(grab.x, grab.y);
    await this.page.mouse.down();
    await this.page.mouse.move(grab.x + 20, grab.y + 20, {steps: 5});
    await this.page.mouse.move(to.x + 12, to.y + 12, {steps: 15});
    await this.page.mouse.up();
  }
}
