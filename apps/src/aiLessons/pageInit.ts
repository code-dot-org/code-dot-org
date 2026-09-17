// Initialization side-effects the AI Lessons entry shim runs once on
// mount:
// - Force the design-system theme at the document root, in case the
//   surrounding studio chrome left it on a different one.
// - Pull in the global code-studio Redux module so its reducers
//   (lab, lab2Project, lab2View, progress, currentUser, etc.) are
//   registered with the singleton store before any lab views mount.

import '@cdo/apps/code-studio/redux';

// Flip this while experimenting with the surrounding chrome's theme.
// Individual lab views (Music, Panels) can still override per-mount via
// LAB_DEFAULT_THEME in EmbeddedLab; this only sets the surface chrome.
const PAGE_THEME: 'Light' | 'Dark' = 'Light';

export function forceTheme(theme: 'Light' | 'Dark' = PAGE_THEME) {
  if (typeof document === 'undefined') return;
  const lower = theme.toLowerCase();
  const opposite = lower === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.remove(`background-${opposite}`);
  document.body.classList.add(`background-${lower}`);
}
