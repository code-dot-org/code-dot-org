import {createTheme} from '@mui/material/styles';

/** MUI theme for the AI for Oceans lab.
 *
 * Fonts inherit from the host (studio shell or standalone dev server) so the
 * lab does not impose its own font stack. */
const oceanTheme = createTheme({
  typography: {
    fontFamily: 'inherit',
  },
});

export default oceanTheme;
