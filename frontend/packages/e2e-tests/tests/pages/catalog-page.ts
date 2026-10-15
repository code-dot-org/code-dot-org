import {BasePage} from './base-page';

/** Page object for the curriculum catalog (/catalog), reachable signed in or out. */
export class CatalogPage extends BasePage {
  /** Navigate to /catalog. */
  async goto(): Promise<void> {
    await this.page.goto('/catalog');
  }
}
