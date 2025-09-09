import cdoTheme from '@/themes/code.org';
import csforallTheme from '@/themes/csforall';
import {CssBaseline, ThemeProvider} from '@mui/material';
import {withThemeFromJSXProvider} from '@storybook/addon-themes';

export default withThemeFromJSXProvider({
  themes: {
    'code.org': cdoTheme,
    csforall: csforallTheme,
  },
  defaultTheme: 'code.org',
  Provider: ThemeProvider,
  GlobalStyles: CssBaseline,
});
