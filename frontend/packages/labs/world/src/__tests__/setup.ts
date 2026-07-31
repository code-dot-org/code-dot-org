// Vitest setup for the whole package (vitest.config.ts `setupFiles`).
//
// Everything here exists for the effect editor (src/effect), which is the only
// part of the lab that renders a measured, canvas-backed surface under jsdom.
// It is global because vitest applies one setup to the run, so each shim below
// is written to be inert for tests that do not need it.

import '@testing-library/jest-dom/vitest';

/**
 * jsdom shims for React Flow.
 *
 * React Flow measures the DOM to place nodes and handles. jsdom implements none
 * of that, so without these stubs the canvas throws on mount and every component
 * test around it fails for reasons unrelated to what it is testing.
 * Layout-dependent behavior is not asserted in unit tests; it is checked in a
 * browser.
 *
 * Each is installed only if absent (`??=`), so a test that provides its own
 * keeps it.
 */
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

class DOMMatrixReadOnlyStub {
  /** React Flow reads `m22` off the transform to recover the current zoom. */
  m22 = 1;
}

globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;
globalThis.DOMMatrixReadOnly ??=
  DOMMatrixReadOnlyStub as unknown as typeof DOMMatrixReadOnly;

globalThis.requestAnimationFrame ??= (callback: FrameRequestCallback) =>
  setTimeout(() => callback(performance.now()), 0) as unknown as number;
globalThis.cancelAnimationFrame ??= (handle: number) => clearTimeout(handle);

/**
 * Answer "no canvas" quietly, for every context type.
 *
 * jsdom has no canvas implementation at all — 2D no more than WebGL — and
 * throws a "Not implemented" stack trace every time one is asked for. Returning
 * null is the same answer without the noise, and it is a case the code already
 * has to handle: a real browser can refuse a context too.
 *
 * Narrowing this to the WebGL types is tempting and wrong. The editor's test
 * textures are drawn in 2D, so jsdom's throw comes right back, once per render.
 * Nor does a blanket override take anything from a test that wants a real
 * canvas: setup runs before the test file, so a test installing its own stub
 * overwrites this one.
 *
 * Guarded because two suites (`@vitest-environment node`) have no DOM at all.
 */
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}
