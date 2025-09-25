import {Components, Theme} from '@mui/material/styles';

export const IMAGE_OVERRIDES: Components<Theme>['MuiImage'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.image--hasBorder': {
        border: `1px solid ${theme.palette.common.black}`,
      },
      '&.image--hasRoundedCorners': {
        borderRadius: theme.shape.borderRadius,
      },
    }),
  },
};
