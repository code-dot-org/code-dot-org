import Section from './Section';
import type {SectionProps} from './types';

// Read-only for now. Editable username, the update-email/update-password modals,
// and the SSO variant land in tasks 5.5 and 5.6.
export default function LoginInformation({settings}: SectionProps) {
  return (
    <Section id="login-information" title="Login Information">
      <dl>
        <dt>Username</dt>
        <dd>{settings.username || '—'}</dd>
        <dt>Email address</dt>
        <dd>{settings.email || 'Hidden'}</dd>
        <dt>Password</dt>
        <dd>{settings.hasPassword ? 'Password set' : 'Signed in with SSO'}</dd>
      </dl>
    </Section>
  );
}
