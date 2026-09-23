import {Box} from '@mui/material';
import {visuallyHidden} from '@mui/utils';

// Legacy parity: a login with no stored address reads as encrypted.
export default function EmailStatus({email}: {email: string | null}) {
  if (email) return email;
  return (
    <>
      <span aria-hidden>***encrypted***</span>
      <Box component="span" sx={visuallyHidden}>
        Email address encrypted
      </Box>
    </>
  );
}
