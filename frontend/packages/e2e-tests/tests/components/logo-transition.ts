import {expect, type Locator, type Page} from '@playwright/test';

import {setCookie} from '../shared/cookies';

const SEEN_COOKIE = 'hide_codeai_logo_transition';

/**
 * The teacher dashboard's first-run logo animation
 * (apps/src/templates/studioHomepages/teacherHomepageV2/LogoTransition.tsx).
 *
 * It hides the header logo two ways — a server-rendered pre-hide <style> and
 * an inline visibility:hidden — so suppressing the animation still leaves the
 * logo hidden until React hydrates. Reading the logo needs both methods.
 */
export class LogoTransitionComponent {
  private readonly page: Page;
  private readonly headerLogoImage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerLogoImage = page.locator('#logo_home_link img');
  }

  /** The cookie domain comes from the current URL, so navigate somewhere first. */
  async suppress(): Promise<void> {
    await setCookie(this.page, SEEN_COOKIE, 'true');
  }

  async waitForSettled(): Promise<void> {
    await expect(this.headerLogoImage).not.toHaveCSS('visibility', 'hidden');
  }
}
