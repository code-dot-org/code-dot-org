import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type {FunctionComponent} from 'react';

/**
 * MUI sx styles for the Sign In button.
 * Uses `&&` double-class specificity to beat MUI's per-variant overrides.
 */
const signInSx = {
  '&&': {
    typography: 'body3',
    backgroundColor: 'transparent',
    color: 'var(--neutral-base-white)',
    border: '1px solid var(--neutral-base-white)',
    borderRadius: '4px',
    boxShadow: 'none',
    textTransform: 'none' as const,
    minWidth: 0,
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  '&&:hover, &&:active, &&:focus-visible': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: 'none',
  },
};

/**
 * MUI sx styles for the Create Account button.
 * Uses `&&` double-class specificity to beat MUI's per-variant overrides.
 */
const createAccountSx = {
  '&&': {
    typography: 'body3',
    backgroundColor: 'var(--neutral-base-white)',
    color: 'var(--background-brand-teal-primary)',
    borderRadius: '4px',
    boxShadow: 'none',
    textTransform: 'none' as const,
    minWidth: 0,
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  '&&:hover, &&:active, &&:focus-visible': {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    boxShadow: 'none',
  },
};

/** Sign In and Create Account buttons shown when no user session is active. */
const SignedOutUserButtons: FunctionComponent = () => (
  <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
    <Button href="/users/sign_in" disableElevation sx={signInSx}>
      Sign In
    </Button>
    <Button
      href="/users/sign_up/account_type"
      disableElevation
      sx={createAccountSx}
    >
      Create Account
    </Button>
  </Box>
);

export default SignedOutUserButtons;
