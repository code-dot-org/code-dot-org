import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import TextField from '@code-dot-org/component-library/textField';

import CreatePasswordModal from '../components/CreatePasswordModal';
import Field from '../components/Field';
import UpdateEmailModal from '../components/UpdateEmailModal';
import UpdatePasswordModal from '../components/UpdatePasswordModal';
import {useField} from '../state/FormContext';
import {providerName} from '../util/providerName';

import Section from './Section';
import type {SectionProps} from './types';

// Email and password are display-only (disabled) fields; editing happens in the
// modals (Figma). Their values aren't part of the profile PATCH. The masked
// values are visual; the aria-labels carry the meaning for screen readers
// (otherwise SR reads "asterisk asterisk…" / a run of bullets).
const MASKED_PASSWORD = '••••••••••••';

// Display-only fields are disabled, but the controlled TextField still wants a
// handler.
const NOOP = () => {};

export default function LoginInformation({settings}: SectionProps) {
  const username = useField('username');
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [createPasswordOpen, setCreatePasswordOpen] = useState(false);

  const providers =
    settings.authenticationOptions
      .map(option => providerName(option.credentialType))
      .join(', ') || 'SSO';

  // Students never see their real email — it's masked (parity with the legacy
  // account page, which shows `***encrypted***`).
  const isStudent = settings.userType === 'student';
  const emailValue = isStudent ? '***encrypted***' : (settings.email ?? '');

  return (
    <Section id="login-information" title="Login Information">
      <Typography variant="body2" sx={{mb: 2}}>
        Make sure you can receive notifications at the email provided.
      </Typography>

      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <Field>
          <TextField
            label="Username"
            name="username"
            value={username.value}
            onChange={event => username.onChange(event.target.value)}
            errorMessage={username.errors[0]}
            aria-invalid={username.errors.length > 0 || undefined}
          />
        </Field>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Field>
            <TextField
              label="Email address"
              name="email-display"
              value={emailValue}
              onChange={NOOP}
              disabled
              aria-label={isStudent ? 'Email address, encrypted' : undefined}
              helperMessage={
                !isStudent && settings.hasPassword
                  ? 'Your password is needed to update your email.'
                  : undefined
              }
            />
          </Field>
          {settings.shouldSeeEditEmailLink && (
            <>
              <Button onClick={() => setEmailOpen(true)} sx={{px: 0}}>
                Update email
              </Button>
              <UpdateEmailModal
                open={emailOpen}
                onClose={() => setEmailOpen(false)}
              />
            </>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Field>
            <TextField
              label="Password"
              name="password-display"
              value={settings.hasPassword ? MASKED_PASSWORD : ''}
              onChange={NOOP}
              disabled
              aria-label={
                settings.hasPassword
                  ? 'Password, set'
                  : `Password, none set — signed in with ${providers}`
              }
              helperMessage={
                settings.hasPassword ? undefined : `Signed in with ${providers}`
              }
            />
          </Field>
          {/* The add/update action is a server-granted entitlement, not an
              inference from `hasPassword`: an SSO-only account with no
              entitlement (e.g. an oauth-only student) gets neither button. */}
          {settings.hasPassword && settings.canEditPassword && (
            <>
              <Button onClick={() => setPasswordOpen(true)} sx={{px: 0}}>
                Update password
              </Button>
              <UpdatePasswordModal
                open={passwordOpen}
                onClose={() => setPasswordOpen(false)}
              />
            </>
          )}
          {!settings.hasPassword && settings.shouldSeeAddPasswordForm && (
            <>
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
