import {
  type Theme,
  useTheme,
} from '@code-dot-org/component-library/common/contexts';

import type {Setting} from '../resourcePanel/types';

/**
 * A Settings-panel dropdown for choosing the editor theme (light/dark). Returns
 * `null` when the lab supports fewer than two themes, so a lab opts in simply by
 * declaring more than one supported theme — music lab, for instance, ships Dark
 * only and gets no toggle.
 *
 * Ported and trimmed from apps/src/lab2/hooks/useThemeSetting.ts. The theme lives
 * in the component-library ThemeProvider (the settings dropdown renders in a
 * portal outside the lab container, so the theme must be set here). Backend
 * user-preference persistence is deferred; the choice is session-only.
 */
export const useThemeSetting = (supportedThemes: Theme[]): Setting | null => {
  const {theme, setTheme} = useTheme();

  if (supportedThemes.length < 2) {
    return null;
  }

  return {
    id: 'theme',
    label: 'Theme',
    options: supportedThemes.map(supported => ({
      value: supported,
      text: supported === 'Dark' ? 'Dark' : 'Light',
    })),
    selectedValue: theme,
    onChange: value => setTheme(value as Theme),
  };
};
