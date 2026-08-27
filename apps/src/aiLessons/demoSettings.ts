// Demo-only settings for the lesson flow, persisted per-browser in
// localStorage so a presenter's choices survive navigation and reloads.
// Nothing here is student data and none of it reaches the server.

import {Theme} from '@code-dot-org/component-library/common/contexts';

import {forceTheme} from './pageInit';
import {AdaptivityMode} from './types';

// Demo-facing copy for the adaptivity dial, shared by the lesson list
// pills and the in-lesson Controls panel.  Mirrors resolveAdaptivity's
// semantics: absent adaptivity means augment as both default and max.
export const ADAPTIVITY_INFO: {
  [mode in AdaptivityMode]: {label: string; blurb: string};
} = {
  static: {
    label: 'Static',
    blurb: 'Authored steps only — no AI adaptation.',
  },
  augment: {
    label: 'Adaptive practice',
    blurb:
      'AI adds targeted practice steps for skills a student has not mastered yet.',
  },
  full: {
    label: 'Fully adaptive',
    blurb: 'AI generates a personalized lesson arc after the diagnostic.',
  },
};

export interface DemoSettings {
  theme: Theme;
}

const STORAGE_KEY = 'aiLessonsDemoSettings';

const DEFAULTS: DemoSettings = {theme: 'Light'};

export function loadDemoSettings(): DemoSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {...DEFAULTS};
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...(parsed && typeof parsed === 'object' ? parsed : {}),
      theme: parsed?.theme === 'Dark' ? 'Dark' : 'Light',
    };
  } catch {
    return {...DEFAULTS};
  }
}

export function saveDemoSettings(settings: DemoSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Private mode or blocked storage — the setting just won't stick.
  }
}

// Apply a theme everywhere it matters: the design-system provider (so
// component-library components follow), and the document root + body
// classes (so page chrome and labs follow).  Pass the provider's
// setTheme from useTheme().
export function applyDemoTheme(theme: Theme, setTheme: (t: Theme) => void) {
  setTheme(theme);
  forceTheme(theme);
}
