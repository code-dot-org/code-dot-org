import {CssBaseline, ThemeProvider} from '@mui/material';
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

  // Delegate to the actual MUI theme decorator
  return BaseMuiDecorator(Story, context);
};

export default MuiDecorator;
