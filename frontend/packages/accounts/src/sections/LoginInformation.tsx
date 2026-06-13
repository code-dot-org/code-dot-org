import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import TextField from '@code-dot-org/component-library/textField';

import CreatePasswordModal from '../components/CreatePasswordModal';
import UpdateEmailModal from '../components/UpdateEmailModal';
import UpdatePasswordModal from '../components/UpdatePasswordModal';
import {useField} from '../state/FormContext';
import {providerName} from '../util/providerName';

import Section from './Section';
import type {SectionProps} from './types';

export default function LoginInformation({settings}: SectionProps) {
  const username = useField('username');
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [createPasswordOpen, setCreatePasswordOpen] = useState(false);

  const providers =
    settings.authenticationOptions
      .map(option => providerName(option.credentialType))
      .join(', ') || 'SSO';

  return (
    <Section id="login-information" title="Login Information">
      <Box sx={{mb: 3, maxWidth: 360}}>
        <TextField
          label="Username"
          name="username"
          value={username.value}
          onChange={event => username.onChange(event.target.value)}
          errorMessage={username.errors[0]}
          aria-invalid={username.errors.length > 0 || undefined}
        />
      </Box>

      {/* dl pairs each read-only label with its value so the relationship is
          programmatic, not just visual. */}
      <Box component="dl" sx={{m: 0}}>
        <Typography component="dt" sx={{fontWeight: 600}}>
          Email address
        </Typography>
        <Box component="dd" sx={{m: 0, mb: 3}}>
          {settings.shouldSeeEditEmailLink ? (
            <>
              <Typography>{settings.email}</Typography>
              <Button onClick={() => setEmailOpen(true)} sx={{px: 0}}>
                Update email
              </Button>
              <UpdateEmailModal
                open={emailOpen}
                onClose={() => setEmailOpen(false)}
              />
            </>
          ) : (
            <Typography>
              {settings.email ?? 'Your email is hidden and can’t be edited.'}
            </Typography>
          )}
        </Box>

        <Typography component="dt" sx={{fontWeight: 600}}>
          Password
        </Typography>
        <Box component="dd" sx={{m: 0}}>
          {settings.hasPassword ? (
            <>
              <Typography>Password set</Typography>
              <Button onClick={() => setPasswordOpen(true)} sx={{px: 0}}>
                Update password
              </Button>
              <UpdatePasswordModal
                open={passwordOpen}
                onClose={() => setPasswordOpen(false)}
              />
            </>
          ) : (
            <>
              <Typography>Signed in with {providers}</Typography>
              <Button onClick={() => setCreatePasswordOpen(true)} sx={{px: 0}}>
                Create password
              </Button>
              <CreatePasswordModal
                open={createPasswordOpen}
                onClose={() => setCreatePasswordOpen(false)}
              />
            </>
          )}
        </Box>
      </Box>
    </Section>
  );
}
