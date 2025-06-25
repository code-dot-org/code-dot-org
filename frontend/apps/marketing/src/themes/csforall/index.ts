'use client';
import {createTheme} from '@mui/material';

const theme = createTheme({
  cssVariables: true,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          ['&.MuiButton-contained.MuiButton-colorPrimary']: {
            backgroundColor: '#15092c',
          },
        },
      },
    },
  },
});

export default theme;
