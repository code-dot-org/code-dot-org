import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type {FunctionComponent} from 'react';

import {AUTH_LINKS} from '../../shared/authLinks';
import {HEADER_BREAKPOINTS} from '../../shared/breakpoints';
import {headerTriggerBase} from '../../shared/headerMenu';

// Prod renders signed-out auth on the teal bar as plain white text links (13px,
// weight 400, no border/fill) — not pills. Both links share this style.
const barAuthLinkSx = {
  ...headerTriggerBase,
  alignSelf: 'stretch',
  minWidth: 0,
  px: '1rem',
  borderRadius: 0,
  color: 'var(--neutral-base-white)',
  fontSize: '13px',
  fontWeight: 400,
  textTransform: 'none' as const,
  whiteSpace: 'nowrap',
  '&:hover, &:active, &:focus-visible': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
};

/** Sign In and Create Account links shown when no user session is active. */
const SignedOutUserButtons: FunctionComponent = () => (
  <Box
    sx={{
      // On the bar at >=768px; hidden below (the hamburger surfaces these).
      // Authored default-visible so jsdom (which ignores @media) keeps the links testable.
      display: 'flex',
      alignSelf: 'stretch',
      alignItems: 'stretch',
      [`@media (max-width:${HEADER_BREAKPOINTS.mobileAuth - 1}px)`]: {
        display: 'none',
      },
    }}
  >
    <Button
      href={AUTH_LINKS.signIn}
      color="inherit"
      disableElevation
      sx={barAuthLinkSx}
    >
      Sign in
    </Button>
    <Button
      href={AUTH_LINKS.createAccount}
      color="inherit"
      disableElevation
      sx={barAuthLinkSx}
    >
      Create account
    </Button>
  </Box>
);

export default SignedOutUserButtons;
