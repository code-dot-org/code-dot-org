import {createContext, useContext, useState, ReactNode} from 'react';

export type Theme = 'Light' | 'Dark';

interface ThemeContextProps {
  /** Theme value */
  theme: Theme;
  /** Toggle between themes (light/dark)*/
  toggleTheme: () => void;
  /** In case we'll have more than 2 themes - we'll be able to update theme value via this callback */
  setTheme: (theme: Theme) => void;
}

/** Same as `ThemeContextProps` but where all properties are optional.  For `useTheme(true)` */
type OptionalThemeContextProps = Partial<ThemeContextProps>;

/**
 * Handles multiple themes logic.
 * ThemeProvider can be stacked, meaning that you can have different theme in existing themeContext by
 * simply wrapping needed section into another ThemeProvider which will
 * break this section out of higher level ThemeProvider. In other words - you can stack ThemeProviders multiple times,
 * the theme value for the styles will be taken from the closest ThemeProvider or html element with data-theme
 * attribute.
 */
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

/**
 * Provides code with values of `ThemeContext` inside of a React component.
 *
 * Default behavior: by default `isThemeOptional` is set to `false`, which means `useTheme` requires
 * the component you're working in to be wrapped by `ThemeProvider` anywhere on a higher level.  If
 * your component is not wrapped in a `ThemeProvider`, `useTheme` will throw an error.
 *
 * Usage example (default use):
 *    const {theme, toggleTheme} = useTheme();
 *
 * Advanced: setting `isThemeOptional` to `true` changes this default behavior and does not
 * require the component you're working in to be wrapped by a `ThemeProvider`. This is useful for
 * parent components that need to pass the theme to a component rendered in a portal (e.g. `Tooltip`)
 * but where the parent isn't always rendered in a provider (e.g. aiComponentLibrary's `CopyButton`).
 *
 * Note: if `isThemeOptional` is `true` and no theme is provided, `theme` will result in a value of
 * `undefined`. In this case `toggleTheme` or `setTheme` will also be undefined if `theme` is
 * `undefined`, so you must account for this in your code.
 *
 * Usage example:
 *    const {theme, toggleTheme} = useTheme(true);
 *    const handleClick = () => {
 *      if(toggleTheme){
 *        toggleTheme()
 *      }
 *    };
 *
 * */
export function useTheme(isThemeOptional: true): OptionalThemeContextProps;
export function useTheme(isThemeOptional?: false): ThemeContextProps;
export function useTheme(
  isThemeOptional = false,
): ThemeContextProps | OptionalThemeContextProps {
  const context = useContext(ThemeContext);
  if (!context) {
    if (isThemeOptional) {
      return {};
    } else {
      throw new Error('useTheme must be used within a ThemeProvider');
    }
  }
  return context;
}

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
