import {type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/**
 * The /projects personal project gallery page.
 *
 * Locator strategy is deliberately mixed:
 *  - the section heading has a stable, locale-independent accessible name, so
 *    it uses getByRole;
 *  - project tiles use the href (/projects/<slug>/new): the tile <a> is a link,
 *    but its accessible name is the localized title (e.g. "لابراتوار اسپرایت")
 *    and it renders 0×0 (its float:left child escapes flow, so Playwright treats
 *    the anchor as hidden). Visibility assertions therefore target the child div;
 *    absence assertions target the bare anchor so a lab reappearing in any markup
 *    is still caught;
 *  - "View full list" uses its #uitest- hook: role=button exists, but its only
 *    accessible name is the volatile localized label, so the purpose-built test
 *    id is the resilient choice (prefer a test id over coupling to changeable
 *    text);
 *  - the full project-type list is a bare <div> with no role, name, or
 *    list/region semantics, so #full-list-projects is the only handle — used as
 *    a "list opened" readiness signal.
 */
export class PersonalProjectGallery extends BasePage {
  /** The "Create a new project" section heading. */
  readonly newProjectHeading: Locator;

  /** "View full list" button. */
  readonly viewFullListButton: Locator;

  /** The full project-type list container (present after viewFullListButton click). */
  readonly fullListProjects: Locator;

  // Tiles in the "Create a new project" section (div-scoped).
  readonly newSpriteLab: Locator;
  readonly newArtist: Locator;
  readonly newAppLab: Locator;
  readonly newGameLab: Locator;

  // Same tiles anywhere on the page (used for full-list assertions).
  readonly anySpriteLab: Locator;
  readonly anyArtist: Locator;
  readonly anyAppLab: Locator;
  readonly anyGameLab: Locator;

  // Labs excluded from Farsi MVP; assert these anchors are absent from the DOM.
  readonly danceLink: Locator;
  readonly playLabLink: Locator;
  readonly webLabLink: Locator;

  constructor(page: Page) {
    super(page);
    this.newProjectHeading = page.getByRole('heading', {
      name: 'Create a new project',
    });
    this.viewFullListButton = page.locator('#uitest-view-full-list');
    this.fullListProjects = page.locator('#full-list-projects');

    // Tile div restricted to the "Create a new project" section.
    const sectionTile = (slug: string): Locator =>
      page.locator(`div a[href='/projects/${slug}/new'] > div`);
    // Tile div anywhere on the page.
    const pageTile = (slug: string): Locator =>
      page.locator(`a[href='/projects/${slug}/new'] > div`);
    // Bare anchor; the stable href contract, for absence assertions.
    const link = (slug: string): Locator =>
      page.locator(`a[href='/projects/${slug}/new']`);

    this.newSpriteLab = sectionTile('spritelab');
    this.newArtist = sectionTile('artist');
    this.newAppLab = sectionTile('applab');
    this.newGameLab = sectionTile('gamelab');

    this.anySpriteLab = pageTile('spritelab');
    this.anyArtist = pageTile('artist');
    this.anyAppLab = pageTile('applab');
    this.anyGameLab = pageTile('gamelab');

    this.danceLink = link('dance');
    this.playLabLink = link('playlab');
    this.webLabLink = link('weblab');
  }

  /** Navigate to /projects (root region, no locale prefix). */
  async goto(): Promise<void> {
    await this.page.goto('/projects', {waitUntil: 'domcontentloaded'});
  }

  /** Wait for the "Create a new project" gallery section to render. */
  async waitForReady(): Promise<void> {
    await this.newProjectHeading.waitFor({state: 'visible'});
  }

  /** Click "View full list" and wait for the full list container to appear. */
  async openFullList(): Promise<void> {
    await this.viewFullListButton.click();
    await this.fullListProjects.waitFor({state: 'visible'});
  }
}
