import {Components, Theme} from '@mui/material/styles';

export const IMAGE_OVERRIDES: Components<Theme>['MuiImage'] = {
  styleOverrides: {
    root: ({theme}) => ({
      '&.image--hasBorder': {
        border: `1px solid var(--borders-neutral-primary)`,
      },
      '&.image--hasShadow': {
        boxShadow: '0.5rem 0.5rem 0 0 var(--background-brand-teal-light)',
      },
      '&.image--hasRoundedCorners': {
        borderRadius: theme.shape.borderRadius,
      },
    }),
  },
};
