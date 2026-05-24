/**
 * Vitest global test setup.  Extends the Vitest `expect` with
 * @testing-library/jest-dom matchers (toBeInTheDocument, toHaveAttribute,
 * toHaveFocus, etc.) for all tests in this package.
 */
import '@testing-library/jest-dom/vitest';

/**
 * jsdom does not implement HTMLDialogElement.showModal() or .close().
 * Polyfill them so ConfirmationDialog.componentDidMount() can run.
 * showModal sets the `open` attribute (making the dialog accessible via
 * role="dialog"); close removes it (matching native modal behaviour).
 */
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (
    this: HTMLDialogElement,
  ): void {
    this.setAttribute('open', '');
  };
}
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
    this.removeAttribute('open');
  };
}
