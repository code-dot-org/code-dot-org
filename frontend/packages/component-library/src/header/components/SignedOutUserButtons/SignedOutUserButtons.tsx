import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type {FunctionComponent} from 'react';

import {AUTH_LINKS} from '../../shared/authLinks';
import {HEADER_BREAKPOINTS} from '../../shared/breakpoints';

/** Sign In button — full-height stretch to match prod's header_button anchor style. */
const signInSx = {
  '&&': {
    backgroundColor: 'transparent',
    color: 'var(--neutral-base-white)',
    border: '1px solid var(--neutral-base-white)',
    borderRadius: '4px',
    boxShadow: 'none',
    textTransform: 'none' as const,
    minWidth: 0,
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: 0,
    paddingBottom: 0,
    alignSelf: 'stretch',
    fontSize: '16px',
  },
  '&&:hover, &&:active, &&:focus-visible': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: 'none',
  },
};

/** Create Account button — full-height stretch to match prod's header_button anchor style. */
const createAccountSx = {
  '&&': {
    backgroundColor: 'var(--neutral-base-white)',
    color: 'var(--background-brand-teal-primary)',
    borderRadius: '4px',
    boxShadow: 'none',
    textTransform: 'none' as const,
    minWidth: 0,
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: 0,
    paddingBottom: 0,
    alignSelf: 'stretch',
    fontSize: '16px',
  },
  '&&:hover, &&:active, &&:focus-visible': {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    boxShadow: 'none',
  },
};

/** Sign In and Create Account buttons shown when no user session is active. */
const SignedOutUserButtons: FunctionComponent = () => (
  <Box
    sx={{
      // On the bar at >=768px; hidden below (prod hides #sign_in_or_user on
      // mobile, where the hamburger surfaces these). Authored default-visible
      // so jsdom (which ignores @media) keeps the buttons testable.
      display: 'flex',
      gap: 1,
      alignSelf: 'stretch',
      alignItems: 'stretch',
      [`@media (max-width:${HEADER_BREAKPOINTS.mobileAuth - 1}px)`]: {
        display: 'none',
      },
    }}
  >
    <Button href={AUTH_LINKS.signIn} disableElevation sx={signInSx}>
      Sign in
    </Button>
    <Button
      href={AUTH_LINKS.createAccount}
      disableElevation
      sx={createAccountSx}
    >
      Create account
    </Button>
  </Box>
);

export default SignedOutUserButtons;
