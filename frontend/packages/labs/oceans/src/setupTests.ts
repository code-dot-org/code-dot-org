/**
 * Vitest global test setup.  Extends the Vitest `expect` with
 * @testing-library/jest-dom matchers (toBeInTheDocument, toHaveAttribute,
 * toHaveFocus, etc.) for all tests in this package.
 */
import '@testing-library/jest-dom/vitest';

/**
 * jsdom lacks HTMLDialogElement.showModal()/close(); polyfill the `open`
 * attribute toggle. Anything depending on real modal semantics (:modal,
 * focus trap, backdrop, scroll lock) belongs in e2e, not here.
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
