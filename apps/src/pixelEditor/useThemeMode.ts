import {useTheme} from '@code-dot-org/component-library/common/contexts';

export type ThemeMode = 'light' | 'dark';

/**
 * The page theme as the dialog components' mode. Without a provider, as in
 * unit tests, the mode is light.
 */
export default function useThemeMode(): ThemeMode {
  const {theme} = useTheme(true);
  return theme === 'Dark' ? 'dark' : 'light';
}
