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

  /** .header_user — the header user slot, present signed-in (menu) or out (sign-in); .first() avoids strict-mode across breakpoints. */
  private readonly user: Locator;

  /** #header_user_signin — the signed-out chrome shown in place of the user menu; .first() guards breakpoint duplicates. */
  readonly signInButton: Locator;

  /**
   * "New project +" create-menu trigger. By CSS, not its role="button": the
   * accessible name absorbs every dropdown link's text once the menu opens.
   */
  readonly createMenu: Locator;

  /** createMenu as a raw selector, for scoping a11y scans to the open dropdown. */
  readonly createMenuSelector = '.create_menu';

  /** "View all projects..." at the foot of the open dropdown. By id: the text is locale-dependent. */
  readonly viewAllProjectsLink: Locator;

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
    this.signInButton = page.locator('#header_user_signin').first();
    this.createMenu = page.locator(this.createMenuSelector);
    this.viewAllProjectsLink = page.locator('#view_all_projects');
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

  /**
   * Wait until the header user area has rendered, in either auth state — the
   * state-agnostic readiness signal used by lab boot. Prefer waitForSignedIn /
   * waitForSignedOut when the auth state itself is what's under test.
   */
  async waitForUserChrome(): Promise<void> {
    await expect(this.user).toBeVisible();
  }

  /** Wait until the signed-in user menu (#header_user_menu) is visible. */
  async waitForSignedIn(): Promise<void> {
    await expect(this.userMenu).toBeVisible();
  }

  /** Wait until the signed-out sign-in chrome (#header_user_signin) is visible. */
  async waitForSignedOut(): Promise<void> {
    await expect(this.signInButton).toBeVisible();
  }

  /**
   * Click a header link and wait for the resulting full-page navigation to
   * settle (the header re-renders on the destination page).
   */
  async clickLink(link: Locator): Promise<void> {
    await link.click();
    await expect(this.headerLinks).toBeVisible();
  }

  /**
   * A create-menu item by project-type id ('spritelab', 'applab', ...), as
   * named by CreateHeader.get_project_info. By id: the link text is
   * locale-dependent, and callers assert absence as well as presence.
   */
  getCreateProjectItem(id: string): Locator {
    return this.page.locator(`#create_dropdown_${id}`);
  }

  /** Open the dropdown, waiting out its jQuery slideDown — the foot link lands last. */
  async openCreateMenu(): Promise<void> {
    await this.createMenu.click();
    await expect(this.viewAllProjectsLink).toBeVisible();
  }
}
