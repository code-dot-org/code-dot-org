import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type {FunctionComponent} from 'react';

import {AUTH_LINKS} from '../../shared/authLinks';

import moduleStyles from './SignedOutUserButtons.module.scss';

// Signed-out auth pills on the teal bar (match prod): Sign in is the outlined
// variant (white border, transparent); Create account is filled white with teal text.

/** Sign in / Create account pills shown when no user session is active. */
const SignedOutUserButtons: FunctionComponent = () => (
  <Box className={moduleStyles.buttons}>
    <Button
      href={AUTH_LINKS.signIn}
      color="inherit"
      disableElevation
      className={moduleStyles.signIn}
    >
      Sign in
    </Button>
    <Button
      href={AUTH_LINKS.createAccount}
      color="inherit"
      disableElevation
      className={moduleStyles.createAccount}
    >
      Create account
    </Button>
  </Box>
);

export default SignedOutUserButtons;
