import {useEffect, useState} from 'react';

export type BackgroundTheme = 'dark' | 'light';

// Classes lab2 (Lab2Wrapper) and the server write on <body> to signal the
// active background. `music-black` is the legacy dark class still used by
// music lab.
const DARK_BODY_CLASSES = ['background-dark', 'music-black'];
const LIGHT_BODY_CLASS = 'background-light';

// Default to dark when nothing has declared a background, matching lab2's own
// default and the historical share-page appearance.
const DEFAULT_THEME: BackgroundTheme = 'dark';

function readBodyTheme(): BackgroundTheme {
  if (typeof document === 'undefined') {
    return DEFAULT_THEME;
  }
  const {classList} = document.body;
  if (DARK_BODY_CLASSES.some(className => classList.contains(className))) {
    return 'dark';
  }
  if (classList.contains(LIGHT_BODY_CLASS)) {
    return 'light';
  }
  return DEFAULT_THEME;
}

/**
 * Track the page's background theme from the `background-*` class on <body>.
 *
 * The logo lives in shared page chrome, outside the lab's React tree, and lab2
 * sets this class asynchronously after the lab loads — so we observe <body>'s
 * class attribute and re-render when it changes rather than reading it once.
 */
export default function useBackgroundTheme(): BackgroundTheme {
  const [theme, setTheme] = useState<BackgroundTheme>(readBodyTheme);

  useEffect(() => {
    // Re-read in case the class changed between initial render and this effect.
    setTheme(readBodyTheme());

    const observer = new MutationObserver(() => setTheme(readBodyTheme()));
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}
