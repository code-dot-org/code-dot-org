import {BasePage} from './base-page';

/**
 * Page object for the signed-in home page (/home). Owns navigation; the
 * signed-in chrome checks (header.waitForSignedIn, etc.) come from the header
 * overlays that appear here — the GDPR dialog, the student-information
 * interstitial — are modeled as their own component objects, not as part of
 * this page.
 */
export class HomePage extends BasePage {
  /** Navigate to /home. */
  async goto(): Promise<void> {
    await this.page.goto('/home');
  }
}
