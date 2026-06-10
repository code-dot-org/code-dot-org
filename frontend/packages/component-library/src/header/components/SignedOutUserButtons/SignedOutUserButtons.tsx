import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type {FunctionComponent} from 'react';

import {AUTH_LINKS} from '../../shared/authLinks';
import {HEADER_BREAKPOINTS} from '../../shared/breakpoints';

// Signed-out auth pills on the teal bar (match prod): Sign in is the outlined
// variant (white border, transparent); Create account is filled white with teal text.
const pillBaseSx = {
  alignSelf: 'center',
  minWidth: 0,
  height: '35px',
  padding: '6.5px 1rem',
  border: '1px solid var(--neutral-base-white)',
  borderRadius: '4px',
  fontSize: '14px',
  lineHeight: 1.5,
  textTransform: 'none' as const,
  whiteSpace: 'nowrap',
  boxShadow: 'none',
  // && beats the theme's `a&:focus-visible` teal ring (these pills render as
  // <a href>), so the focus outline stays the inverse-white that shows on the bar.
  '&&:focus-visible': {
    outline: '2px solid var(--text-neutral-inverse)',
    outlineOffset: '2px',
  },
};

const signInSx = {
  ...pillBaseSx,
  color: 'var(--neutral-base-white)',
  backgroundColor: 'transparent',
  fontWeight: 400,
  '&:hover, &:active': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    border: '1px solid var(--neutral-base-white)',
  },
};

const createAccountSx = {
  ...pillBaseSx,
  color: 'var(--text-brand-teal-primary)',
  backgroundColor: 'var(--neutral-base-white)',
  fontWeight: 600,
  '&:hover, &:active': {
    backgroundColor: 'var(--neutral-base-white)',
    boxShadow: 'none',
    border: '1px solid var(--neutral-base-white)',
  },
};

/** Sign in / Create account pills shown when no user session is active. */
const SignedOutUserButtons: FunctionComponent = () => (
  <Box
    sx={{
      // On the bar at >=768px; hidden below (the hamburger surfaces these).
      // Authored default-visible so jsdom (which ignores @media) keeps the buttons testable.
      display: 'flex',
      alignItems: 'center',
      columnGap: '8px',
      [`@media (max-width:${HEADER_BREAKPOINTS.mobileAuth - 1}px)`]: {
        display: 'none',
      },
    }}
  >
    <Button
      href={AUTH_LINKS.signIn}
      color="inherit"
      disableElevation
      sx={signInSx}
    >
      Sign in
    </Button>
    <Button
      href={AUTH_LINKS.createAccount}
      color="inherit"
      disableElevation
      sx={createAccountSx}
    >
      Create account
    </Button>
  </Box>
);

export default SignedOutUserButtons;
