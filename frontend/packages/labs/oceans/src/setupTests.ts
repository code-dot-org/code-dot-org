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
 *
 * NOTE: this polyfill only toggles the `open` attribute.  It does NOT
 * reproduce real `showModal()` semantics — no top-layer promotion, no
 * inert-everything-else focus trap, no `:modal` CSS state, no `::backdrop`
 * pseudo-element.  Tests that depend on those (focus containment, backdrop
 * styling, escape-to-close, scroll lock) belong in the Playwright e2e suite,
 * not here.
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
