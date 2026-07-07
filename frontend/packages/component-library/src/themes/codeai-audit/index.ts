import {createTheme} from '@mui/material';

import CdoTheme from '../code.org';

/**
 * Pink audit MUI theme — pairs with the all-pink CSS token overrides in
 * component-library-styles/brandCodeAiAudit.css. Everything MUI-themed
 * renders hot pink so it is trivially easy to spot which surfaces flow
 * through the theme/token system and which do not.
 *
 * Typography and component-level style overrides are inherited from the
 * Code.org theme via deep merge; only the palette differs.
 */
const theme = createTheme(CdoTheme, {
  palette: {
    primary: {
      main: '#FF69B4', // hot pink
      light: '#FF99CC',
      dark: '#CC5490',
      contrastText: '#FFFFFF',
    },
  },
});

export default theme;
