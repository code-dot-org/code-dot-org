import {alpha} from '@mui/material/styles';

import theme from '@/themes/csforall';

import {DRAWER_BREAKPOINT} from './constants';

export const commonStyles = {
  appBar: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 4),
    [`@media (max-width: ${DRAWER_BREAKPOINT}px)`]: {
      '.link-list-desktop, .call-to-action': {
        display: 'none',
      },
    },
  },
  toolBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSide: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
  drawer: {
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      maxWidth: '430px',
      width: '100%',
      paddingBlock: theme.spacing(3.5),
      paddingInline: theme.spacing(4),
      '& .MuiListItem-root': {
        padding: 0,
        paddingBottom: theme.spacing(4),
        '& a': {
          margin: 0,
        },
      },
      '& .logo-link': {
        display: 'none',
        [`@media (max-width: 494px)`]: {
          display: 'block',
          marginBottom: theme.spacing(4),
        },
      },
      '& .link-list-drawer a:hover, & .link-list-drawer a:active': {
        color: theme.palette.secondary.main,
      },
      '& .call-to-action': {
        width: '100%',
      },
    },
  },
  drawerContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 'inherit',
  },
  button: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.body3.fontSize,
    textDecoration: 'none',
    marginBottom: 0,
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
  },
};
