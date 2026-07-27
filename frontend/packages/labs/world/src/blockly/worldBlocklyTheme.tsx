// World Lab's Blockly "block color theme" selection, plus dark-mode sync. Two
// theme systems meet here: the app's light/dark mode (component-library
// `useTheme`) and the Blockly block-color themes (`@code-dot-org/blockly`, which
// ship in light/dark pairs — `default` / `default-dark`, etc.). The learner picks
// a base (light) theme in the settings pane; when the app switches to dark mode
// we apply that theme's `-dark` variant. The chosen theme reaches each Blockly
// editor via the `BlocklyWorkspace` `theme` prop (World mounts a Blockly provider
// per file, so a workspace-context `setTheme` would not reach them).

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {Theme} from '@code-dot-org/blockly';
import {
  DARK_THEME_SUFFIX,
  themeOptions,
  themes,
} from '@code-dot-org/blockly/themes';
import {useTheme} from '@code-dot-org/component-library/common/contexts';

const STORAGE_KEY = 'worldBlocklyTheme';
const DEFAULT_BASE = themeOptions[0].value; // 'default'

/** The Blockly theme name to apply: the `-dark` variant in dark mode. */
export function blocklyThemeName(base: string, isDark: boolean): string {
  const dark = `${base}-${DARK_THEME_SUFFIX}`;
  if (isDark && themes[dark]) {
    return dark;
  }
  return themes[base] ? base : DEFAULT_BASE;
}

interface WorldBlocklyThemeValue {
  /** `[{value, text}]` base (light) theme options for the settings dropdown. */
  options: ReadonlyArray<{value: string; text: string}>;
  /** The selected base theme name (persisted). */
  selectedBase: string;
  setSelectedBase: (name: string) => void;
  /** The Blockly theme to apply — dark variant when the app is in dark mode. */
  theme: Theme;
}

const fallback = (): WorldBlocklyThemeValue => ({
  options: themeOptions,
  selectedBase: DEFAULT_BASE,
  setSelectedBase: () => {},
  theme: themes[DEFAULT_BASE],
});

const WorldBlocklyThemeContext = createContext<WorldBlocklyThemeValue | null>(
  null,
);

export function WorldBlocklyThemeProvider({children}: {children: ReactNode}) {
  // Lenient: outside the app ThemeProvider (e.g. tests) `theme` is undefined,
  // which reads as light.
  const {theme: appTheme} = useTheme(true);
  const isDark = appTheme === 'Dark';

  const [selectedBase, setSelectedBaseState] = useState<string>(() => {
    const stored =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    return stored && themes[stored] ? stored : DEFAULT_BASE;
  });

  const setSelectedBase = useCallback((name: string) => {
    setSelectedBaseState(name);
    try {
      window.localStorage.setItem(STORAGE_KEY, name);
    } catch {
      // Private mode / no storage: keep the in-memory selection.
    }
  }, []);

  const value = useMemo<WorldBlocklyThemeValue>(
    () => ({
      options: themeOptions,
      selectedBase,
      setSelectedBase,
      theme: themes[blocklyThemeName(selectedBase, isDark)],
    }),
    [selectedBase, setSelectedBase, isDark],
  );

  return (
    <WorldBlocklyThemeContext.Provider value={value}>
      {children}
    </WorldBlocklyThemeContext.Provider>
  );
}

/** The Blockly theme state; a light-default fallback outside the provider. */
export function useWorldBlocklyTheme(): WorldBlocklyThemeValue {
  return useContext(WorldBlocklyThemeContext) ?? fallback();
}
