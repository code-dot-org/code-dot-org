import React, {useState} from 'react';

/**
 * Provides the current theme for all components in a lab.
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export const DEFAULT_THEME: Theme = Theme.DARK;

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const ThemeWrapper: React.FunctionComponent<ThemeWrapperProps> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  return (
    <ThemeContext.Provider value={{theme, setTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: DEFAULT_THEME,
  setTheme: () => undefined,
});

export default ThemeWrapper;
