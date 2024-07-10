import React, {createContext, useContext, useState, ReactNode} from 'react';

type Theme = 'Light' | 'Dark';

interface ThemeContextProps {
  /** Theme value */
  theme: Theme;
  /** Toggle between themes (light/dark)*/
  toggleTheme: () => void;
  /** In case we'll have more than 2 themes - we'll be able to update theme value via this callback */
  setTheme: (theme: Theme) => void;
}

/**
 * Handles multiple themes logic.
 * ThemeProvider can be stacked, meaning that you can have different theme in existing themeContext by
 * simply wrapping needed section into another ThemeProvider which will
 * break this section out of higher level ThemeProvider. In other words - you can stack ThemeProviders multiple times,
 * the theme value for the styles will be taken from the closest ThemeProvider or html element with data-theme
 * attribute.
 */
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

/** Provides code with values of ThemeContext inside of React component.
 * Please note that in order to work correctly - it requires component you're working in to be wrapped by ThemeProvider
 * anywhere on higher level
 *
 * Usage example:
 *    const {theme, toggleTheme} = useTheme();
 * */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Provides code with theme context. Can be used on the higher level (e.g. React app entry point)
 * or on any level you need.
 * Usage example:
 *  <ThemeProvider>
 *    <App {...args} />
 *  </ThemeProvider>
 *
 *  AND/OR
 *
 *  <ThemeProvider>
 *    <Alert {...args} />
 *  </ThemeProvider>
 * */
export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const [theme, setTheme] = useState<Theme>('Light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'Light' ? 'Dark' : 'Light'));
  };

  /**
   * We're adding data-theme attribute to a html element to be able to access current theme value in styles
   * (scss/css files) via selectors(e.g. [data-theme='Light']). (See: ./../styles/colors.css)
   * */
  return (
    <ThemeContext.Provider value={{theme, toggleTheme, setTheme}}>
      <div data-theme={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};
