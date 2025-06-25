'use client';
import {createTheme} from '@mui/material';

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          ['&.MuiButton-contained.MuiButton-colorPrimary']: {
            backgroundColor: '#8c52ba',
          },
        },
      },
    },
  },
});

export default theme;
