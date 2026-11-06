import {expect, type Locator, type Page} from '@playwright/test';

import {LessonLevelPage} from '../../pages/lesson-level-page';

/** The ui-test-spritelab-lab2 unit, one lesson, levels 1 to 5. */
export const SPRITELAB_LAB2_COURSE = 'ui-test-spritelab-lab2';

/**
 * Page object for Sprite Lab in Lab2 (apps/src/p5lab/spritelab/lab2).
 *
 * DOM contract:
 * - The editors sit in a group named "Edit" (EditorSwitch.tsx) with one
 *   button per editor: Images, World, Code.
 * - The Images tab is the region named "Images" (SpriteLab2View.tsx); its
 *   list has the "New image" plus with a menu of kinds, word chips are
 *   buttons named by their word (WordMenus.tsx), and the rating is the
 *   "Good" and "Not so good" buttons (RatingBar.tsx).
 * - The World tab is the grid named "World" of gridcell buttons, with the
 *   radiogroup "Items to place" beside it (WorldTab.tsx).
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
  readonly playButton: Locator;
  readonly stopButton: Locator;
  readonly worldGrid: Locator;
  readonly itemsToPlace: Locator;
  readonly flyout: Locator;
  readonly workspace: Locator;

  constructor(page: Page) {
    super(page);
    this.editors = page.getByRole('group', {name: 'Edit'});
    this.imagesTab = page.getByRole('region', {name: 'Images', exact: true});
    this.newImageButton = page.getByRole('button', {name: 'New image'});
    this.generateButton = page.getByRole('button', {name: /^Generate/});
    this.animatedSwitch = page.getByRole('checkbox', {name: 'Animated'});
    this.goodButton = page.getByRole('button', {name: 'Good', exact: true});
    this.continueButton = page.getByRole('button', {name: /^Continue/});
    // Named by its icon glyph and the word; "Play this scene" is another button.
    this.playButton = page.getByRole('button', {name: /Play$/});
    this.stopButton = page.getByRole('button', {name: /Stop$/});
    this.worldGrid = page.getByRole('grid', {name: 'World'});
    this.itemsToPlace = page.getByRole('radiogroup', {name: 'Items to place'});
    this.flyout = page.locator('.blocklyFlyout');
    this.workspace = page.locator('svg.blocklySvg g.blocklyWorkspace').first();
  }

  async gotoUnitLevel(level: number): Promise<void> {
    await this.gotoLevel({course: SPRITELAB_LAB2_COURSE, lesson: 1, level});
    await this.waitForReady();
  }

  /** The lab is up once its editor switch is on screen. */
  async waitForReady(): Promise<void> {
    await expect(this.editors).toBeVisible({timeout: 45_000});
  }

  /**
   * Press Play and wait for the game to be running: the stop button shows
   * once the engine has taken the program, and the sprites load for a
   * moment after that before keys move anything.
   */
  async play(): Promise<void> {
    await this.playButton.click();
    await expect(this.stopButton).toBeVisible();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Hold one of the on-screen game controls (PlayBar.tsx: Left, Right,
   * Jump) for `ms`. They send the game the same key events as the keyboard
   * and need no focus, which a synthetic keypress in a headless browser
   * does not reliably have.
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
   * frames after Play can still be loading the sprites' pictures, during
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

  async expectObjectiveDone(text: string | RegExp): Promise<void> {
    await expect(this.objective(text)).toContainText('Done:');
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

  /** A stack on the workspace by a piece of its top block's text: the
      outermost block group, which spans the whole stack. A pinned when run
      is not draggable, so this matches on the block class, not the
      draggable one. */
  workspaceBlock(text: string): Locator {
    return this.workspace
      .locator('.blocklyBlockCanvas > g.blocklyBlock')
      .filter({hasText: text})
      .first();
  }

  /**
   * Drag a flyout block to hang under the stack whose top block shows
   * `stackText`: dropped just below the stack's last block, where Blockly
   * snaps it on.
   */
  async dragFlyoutBlockUnder(text: string, stackText: string): Promise<void> {
    const stack = this.workspaceBlock(stackText);
    const box = await stack.boundingBox();
    if (!box) {
      throw new Error(`cannot drop under "${stackText}": not on screen`);
    }
    await this.dragFlyoutBlockToPoint(text, {x: box.x, y: box.y + box.height});
  }

  /**
   * Drag a flyout block so its top-left lands on `target`'s top-left:
   * Blockly then snaps its connection to the stack it was dropped on. The
   * pointer moves in steps, since Blockly starts a drag only past its drag
   * radius.
   */
  async dragFlyoutBlockTo(text: string, target: Locator): Promise<void> {
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
    // An edit re-runs the preview after a 400ms debounce, held on its first
    // frame. A Play pressed inside that window is overtaken by the held
    // preview, and the game sits frozen behind a Stop button; a student is
    // slower than that, so the test is too.
    await this.page.waitForTimeout(1500);
  }
}
