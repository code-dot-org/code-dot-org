import {type Locator} from '@playwright/test';

/**
 * A legacy BaseDialog overlay (apps/src/templates/BaseDialog).
 *
 * Constructed from its own container rather than from the page: several of
 * these can be mounted at once (a dismissed one stays in the DOM, just
 * hidden), and every one of them renders its close button with the same
 * `#x-close` id — duplicate ids, so the id identifies nothing. The container
 * is the only thing that tells two dialogs apart, which is why it is the
 * constructor argument.
 */
export class LegacyDialogComponent {
  /** The dialog's own root; scopes every child locator. */
  readonly container: Locator;

  /** Close ("x") button, by its accessible name rather than its id. */
  readonly closeButton: Locator;

  constructor(container: Locator) {
    this.container = container;
    this.closeButton = container.getByRole('button', {name: 'Close'});
  }

  /** Dismiss the dialog. Cucumber: "I close the dialog". */
  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
