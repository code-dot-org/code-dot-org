import {createTheme} from '@mui/material';

import CdoTheme from '../code.org';

/**
 * CodeAI MUI theme — visually distinct from the Code.org theme.
 *
 * Uses a hot-pink primary palette as a placeholder.  Swap the hex values
 * below once final brand colours are available.
 *
 * Typography and component-level style overrides are inherited from the
 * Code.org theme via deep merge; only the palette differs.
 */
const theme = createTheme(CdoTheme, {
  palette: {
    primary: {
      main: '#FF69B4', // hot pink — placeholder
      light: '#FF99CC',
      dark: '#CC5490',
      contrastText: '#FFFFFF',
    },
  },
});

export default theme;
