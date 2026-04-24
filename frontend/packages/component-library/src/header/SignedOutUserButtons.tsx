import {Box, Button} from '@mui/material';
import {FunctionComponent} from 'react';

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
