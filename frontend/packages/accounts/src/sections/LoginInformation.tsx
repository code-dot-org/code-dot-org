import type {SectionProps} from './types';

// Read-only skeleton (task 5.2). Username row, update-email and update-password
// modals, and the SSO variant land in tasks 5.5 and 5.6.
export default function LoginInformation({settings}: SectionProps) {
  return (
    <section aria-labelledby="login-information-heading">
      <h2 id="login-information-heading">Login Information</h2>
      <dl>
        <dt>Username</dt>
        <dd>{settings.username || '—'}</dd>
        <dt>Email address</dt>
        <dd>{settings.email || 'Hidden'}</dd>
        <dt>Password</dt>
        <dd>{settings.hasPassword ? 'Password set' : 'Signed in with SSO'}</dd>
      </dl>
    </section>
  );
}
