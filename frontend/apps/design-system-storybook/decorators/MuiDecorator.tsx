import {
  CssBaseline,
  GlobalStyles,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material';
import {withThemeFromJSXProvider} from '@storybook/addon-themes';
import {Decorator, StoryContext} from '@storybook/react-vite';

import {CdoTheme} from '@code-dot-org/component-library/themes';

const BaseMuiDecorator = withThemeFromJSXProvider({
  themes: {
    'code.org': CdoTheme,
  },
  defaultTheme: 'code.org',
  Provider: ThemeProvider,
  GlobalStyles: CssBaseline,
});

// Mirror the studio app: MUI's emotion styles go in an @layer so unlayered CSS
// (the header's .module.scss) overrides them without specificity hacks. Keeps
// Storybook (and Eyes) faithful to how the app renders the header.
const cssLayerOrder = (
  <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
);

/**
 * Applies the MUI ThemeProvider decorator for all stories by default.
 * Stories can opt out by setting `parameters.useMui = false`.
 */
const MuiDecorator: Decorator = (Story, context: StoryContext) => {
  const enabled = context.parameters?.useMui ?? true;

  if (!enabled) {
    // Just render the story without the theme wrapper
    return <Story />;
  }

  // Delegate to the MUI theme decorator, with emotion styles in @layer mui.
  return (
    <StyledEngineProvider enableCssLayer>
      {cssLayerOrder}
      {BaseMuiDecorator(Story, context)}
    </StyledEngineProvider>
  );
};

export default MuiDecorator;
