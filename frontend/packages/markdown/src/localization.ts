import {localization} from '@code-dot-org/core/plugins/localization';

/**
 * Markdown localization, wired directly to the core localization plugin
 * (`@code-dot-org/core/plugins/localization`). There is no host setup beyond
 * the core plugin itself: when LocalizeJS is loaded, markdown content is
 * translated at build time and re-translated on locale change; until then (or
 * on a host that never loads it) localization is a no-op and paragraphs use the
 * runtime `data-isolate` path.
 */

let version = 0;
let bound = false;
const listeners = new Set<() => void>();

const ensureBound = (): void => {
  if (bound) {
    return;
  }
  bound = true;
  // Core fires 'change' when LocalizeJS loads and on every locale switch (and
  // once immediately on registration). Bump the snapshot so subscribed
  // components re-render and re-run the synchronous translate.
  localization.on('change', () => {
    version += 1;
    listeners.forEach(listener => listener());
  });
};

/** useSyncExternalStore subscribe: re-render on load / locale change. */
export const subscribeLocalization = (onChange: () => void): (() => void) => {
  ensureBound();
  listeners.add(onChange);
  return () => listeners.delete(onChange);
};

/** useSyncExternalStore snapshot: advances on every locale change. */
export const getLocalizationVersion = (): number => version;

/** Whether LocalizeJS is loaded and build-time translation should run. */
export const isLocalizationActive = (): boolean => localization.isLocalizeJS();

/**
 * Translate a fragment of inline HTML, preserving element structure. Translates
 * a detached element (string translation would collapse to text); returns the
 * input unchanged when translation is unavailable.
 */
export const translateHtml = (html: string): string => {
  if (typeof document === 'undefined' || !localization.isLocalizeJS()) {
    return html;
  }
  // data-isolate marks the element as one translation unit.
  const container = document.createElement('p');
  container.setAttribute('data-isolate', 'true');
  container.innerHTML = html;
  localization.translate(container);
  return container.innerHTML;
};
