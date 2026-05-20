// Initialization side-effects the AI Lessons entry shim runs once on
// mount:
// - Force the design-system light theme at the document root, in case
//   the surrounding studio chrome left it on dark.
// - Pull in the global code-studio Redux module so its reducers
//   (lab, lab2Project, lab2View, progress, currentUser, etc.) are
//   registered with the singleton store before any lab views mount.

import '@cdo/apps/code-studio/redux';

export function forceLightTheme() {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', 'Light');
  document.body.classList.remove('background-dark');
  document.body.classList.add('background-light');
}
