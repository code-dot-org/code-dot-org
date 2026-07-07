import {expect, type Locator, type Page} from '@playwright/test';

/**
 * The site-wide navigation header: present on every authenticated page —
 * student /home, teacher /teacher_dashboard/home, and GE-prefixed variants. A
 * global component composed onto BasePage (as `page.header`), not a page.
 */
export class HeaderComponent {
  private readonly page: Page;

  /** The container holding all nav anchor links. */
  readonly headerLinks: Locator;

  /** "My Dashboard" nav link (the home slot). */
  readonly myDashboardLink: Locator;

  /** "Course Catalog" nav link. */
  readonly courseCatalogLink: Locator;

  /** "Projects" nav link. */
  readonly projectsLink: Locator;

  /** "Professional Learning" nav link (teachers only). */
  readonly professionalLearningLink: Locator;

  /** "Incubator" nav link. */
  readonly incubatorLink: Locator;

  /**
   * Home logo link. Its <img> is visibility:hidden, so the link exposes no
   * accessible name; addressed by id rather than role/name.
   */
  readonly logoLink: Locator;

  /** #header_user_menu — the signed-in user menu; .first() guards breakpoint duplicates. */
  readonly userMenu: Locator;

  /** .display_name — the signed-in user's display name chip; .first() guards breakpoint duplicates. */
  readonly displayName: Locator;

  /** .header_user — the signed-in chrome; .first() avoids strict-mode failure across breakpoints. */
  private readonly user: Locator;

  /** "Sign in" link shown in place of the user menu when signed out. */
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerLinks = page.locator('.headerlinks');
    this.myDashboardLink = this.link('My Dashboard');
    this.courseCatalogLink = this.link('Course Catalog');
    this.projectsLink = this.link('Projects');
    this.professionalLearningLink = this.link('Professional Learning');
    this.incubatorLink = this.link('Incubator');
    this.logoLink = page.locator('#logo_home_link');
    this.userMenu = page.locator('#header_user_menu').first();
    this.displayName = page.locator('.display_name').first();
    this.user = page.locator('.header_user').first();
    this.signInLink = page.getByRole('link', {name: 'Sign in'}).first();
  }

  /** A header nav link by its visible label (its accessible name). */
  private link(name: string): Locator {
    return this.headerLinks.getByRole('link', {name, exact: true});
  }

  /**
   * A header nav link by DOM id. Reserved for cases an accessible-name locator
   * cannot address: the displayed label is locale-dependent (the slot must be
   * identified independently of its text), or the slot is asserted absent.
   */
  linkById(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  /** Wait until the header link container is visible. */
  async waitForVisible(): Promise<void> {
    await expect(this.headerLinks).toBeVisible();
  }

  /** Wait until the signed-in header chrome is visible. */
  async waitForSignedIn(): Promise<void> {
    await expect(this.user).toBeVisible();
  }

  /** Wait until the signed-out "Sign in" chrome is visible. */
  async waitForSignedOut(): Promise<void> {
    await expect(this.signInLink).toBeVisible();
  }

  /**
   * Click a header link and wait for the resulting full-page navigation to
   * settle (the header re-renders on the destination page).
   */
  async clickLink(link: Locator): Promise<void> {
    await link.click();
    await expect(this.headerLinks).toBeVisible();
  }
}
