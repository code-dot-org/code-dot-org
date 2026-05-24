/** Global test setup: jest-dom matchers and an HTMLDialogElement polyfill. */
import '@testing-library/jest-dom/vitest';

/** Polyfill showModal()/close() as `open` attribute toggles; modal semantics belong in e2e. */
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
