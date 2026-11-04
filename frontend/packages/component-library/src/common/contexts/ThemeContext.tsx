import DefaultPropsProvider from '@mui/material/DefaultPropsProvider';
import {useTheme as useMuiTheme} from '@mui/material/styles';
import {
  ComponentProps,
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';

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

type DefaultProps = ComponentProps<typeof DefaultPropsProvider>['value'];

/** Tooltip, Popper, Popover and Menu portal to <body>, outside the data-theme div. */
const PortalThemeProvider = ({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) => {
  // MUI's ThemeProvider feeds DefaultPropsProvider from these; this one replaces it.
  const outer = useMuiTheme().components;
  const value = useMemo(
    () =>
      ({
        ...outer,
        MuiPopper: withDataTheme(outer?.MuiPopper, theme),
        MuiPopover: withDataTheme(outer?.MuiPopover, theme),
      }) as DefaultProps,
    [outer, theme],
  );
  return <DefaultPropsProvider value={value}>{children}</DefaultPropsProvider>;
};

function withDataTheme<T extends {defaultProps?: object}>(
  entry: T | undefined,
  theme: Theme,
) {
  return {
    ...entry,
    defaultProps: {...entry?.defaultProps, 'data-theme': theme},
  };
}

const noop = () => {};

interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Pins the subtree to this theme. setTheme and toggleTheme then act on the
   * enclosing provider, and the pinned subtree keeps its theme.
   */
  theme?: Theme;
  /** Starting theme of an unpinned provider. */
  initialTheme?: Theme;
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
 *
 * To keep a section in one theme regardless of the surrounding one, pin it:
 *  <ThemeProvider theme="Light">
 *    <Drawer />
 *  </ThemeProvider>
 *
 * Prefer this over a bare data-theme attribute, which MUI portals do not see.
 * */
export const ThemeProvider = ({
  children,
  theme: pinnedTheme,
  initialTheme = 'Light',
}: ThemeProviderProps) => {
  const enclosing = useContext(ThemeContext);
  const [ownTheme, setOwnTheme] = useState<Theme>(initialTheme);
  const theme = pinnedTheme ?? ownTheme;

  const value = useMemo<ThemeContextProps>(() => {
    if (pinnedTheme) {
      return {
        theme: pinnedTheme,
        setTheme: enclosing?.setTheme ?? noop,
        toggleTheme: enclosing?.toggleTheme ?? noop,
      };
    }
    return {
      theme: ownTheme,
      setTheme: setOwnTheme,
      toggleTheme: () =>
        setOwnTheme(prevTheme => (prevTheme === 'Light' ? 'Dark' : 'Light')),
    };
  }, [pinnedTheme, ownTheme, enclosing?.setTheme, enclosing?.toggleTheme]);

  /**
   * We're adding data-theme attribute to a html element to be able to access current theme value in styles
   * (scss/css files) via selectors(e.g. [data-theme='Light']). (See: ./../styles/colors.css)
   * */
  return (
    <ThemeContext.Provider value={value}>
      <PortalThemeProvider theme={theme}>
        {/* A pinned section wraps existing markup; it must not add a box. */}
        <div
          data-theme={theme}
          style={pinnedTheme ? {display: 'contents'} : undefined}
        >
          {children}
        </div>
      </PortalThemeProvider>
    </ThemeContext.Provider>
  );
};
