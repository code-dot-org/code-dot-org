export const setAssetPath = (path) => {
  global.__desired_webpack_public_path__ = path;
};

// Sync webpack's internal public path (__webpack_require__.p) with the global.
// This is needed when this bundle is nested inside another webpack bundle (e.g.
// code-dot-org apps): webpack's automatic script-tag URL detection runs first
// and sets __webpack_require__.p to the host bundle's path. By overriding it
// here — before source files evaluate their module-level asset requires —
// asset/resource URLs (sounds, model.json) resolve to the correct location.
// Fall back to '/' for running locally.

/* eslint-disable-next-line no-undef */
__webpack_public_path__ = global.__desired_webpack_public_path__ || '/';
