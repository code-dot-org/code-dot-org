import {CssBaseline, ThemeProvider} from '@mui/material';
import {withThemeFromJSXProvider} from '@storybook/addon-themes';
import {Decorator, StoryContext} from '@storybook/react-webpack5';

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
 * Conditionally applies the MUI ThemeProvider decorator based on the
 * `useMui` parameter in the story's context. By default, MUI is not applied.
 *
 * As more components are migrated to MUI, we can flip the default to true and
 * only disable MUI for non-MUI stories.
 */
const MuiDecorator: Decorator = (Story, context: StoryContext) => {
  const enabled = context.parameters?.useMui ?? false;

  if (!enabled) {
    // Just render the story without the theme wrapper
    return <Story />;
  }

  // Delegate to the actual MUI theme decorator
  return BaseMuiDecorator(Story, context);
};

export default MuiDecorator;
