import {
  expect,
  type FrameLocator,
  type Locator,
  type Page,
} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/**
 * Page object for the 'map' (curriculum reference) level type:
 * a server-rendered iframe (#curriculum-reference) pointing at a static
 * reference-guide document. See dashboard/app/views/levels/_curriculum_reference.haml.
 */
export class MapLevel extends LessonLevelPage {
  /**
   * The reference iframe; server-rendered display:none until its onload
   * handler reveals it. Addressed by its literal id: the accessibility tree
   * exposes it with role 'iframe' but no accessible name/title (it carries no
   * title attribute), so an id selector is the only stable way to name it —
   * matches the a11y gap flagged by the 'frame-title' axe violation below.
   */
  readonly referenceIframe: Locator;

  /** Content inside the reference iframe. Same id, same reasoning as referenceIframe. */
  readonly referenceFrame: FrameLocator;

  /**
   * The reference document's body, inside referenceFrame. Selector mirrors
   * the feature's literal "#body" step argument; the framed body is the root
   * of its own document and exposes no distinct accessible role to query by.
   */
  readonly referenceBody: Locator;

  constructor(page: Page) {
    super(page);
    this.referenceIframe = page.locator('#curriculum-reference');
    this.referenceFrame = page.frameLocator('#curriculum-reference');
    this.referenceBody = this.referenceFrame.locator('#body');
  }

  /**
   * Navigate to a map level. The iframe is present in the DOM (src already
   * set) from first paint, styled display:none until the framed document's
   * own onload handler reveals it — so only wait for DOM attachment here,
   * matching the original Selenium step ("I wait to see"), which used
   * find_elements and never asserted visibility. The real synchronization
   * happens where callers assert on referenceBody's text, which polls until
   * the framed document has actually loaded.
   */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await expect(this.referenceIframe).toBeAttached();
  }
}
