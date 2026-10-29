/**
 * Applab's callers read the DOM of its React roots right after rendering,
 * so those renders run under flushSync. Inside React's own commit flushSync
 * cannot flush; renders requested there wait for the commit to finish.
 */

import {flushSync} from 'react-dom';

let deferring = false;
const deferred = new Map();

/**
 * Runs render synchronously, or, while a mount is deferring, records it as
 * the latest render for key.
 */
export function renderSync(key, render) {
  if (deferring) {
    deferred.set(key, render);
  } else {
    flushSync(render);
  }
}

/**
 * Runs mount, then applies the renders it deferred, synchronously.
 */
export function deferSyncRenders(mount) {
  deferring = true;
  try {
    mount();
  } finally {
    deferring = false;
    const renders = [...deferred.values()];
    deferred.clear();
    if (renders.length > 0) {
      flushSync(() => renders.forEach(render => render()));
    }
  }
}
