/**
 * Phaser 4's ESM bundle probes canvas at import time (checkInverseAlpha and
 * friends), which jsdom does not implement. The unit tests never construct a
 * Game — they only import engine classes — so a minimal 2d-context stub is
 * enough to survive the import-time side effects.
 */
const noop = () => {};

const fakeContext = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop === 'getImageData') {
        return () => ({data: new Uint8ClampedArray(4)});
      }
      if (prop === 'measureText') {
        return () => ({width: 0});
      }
      return noop;
    },
    set() {
      return true;
    },
  },
);

HTMLCanvasElement.prototype.getContext = (() =>
  fakeContext) as typeof HTMLCanvasElement.prototype.getContext;
