import {CssBaseline, ThemeProvider} from '@mui/material';
import {withThemeFromJSXProvider} from '@storybook/addon-themes';

import {CdoTheme} from '@code-dot-org/component-library/themes';

export default withThemeFromJSXProvider({
  themes: {
    'code.org': CdoTheme,
  },
  defaultTheme: 'code.org',
  Provider: ThemeProvider,
  GlobalStyles: CssBaseline,
});
