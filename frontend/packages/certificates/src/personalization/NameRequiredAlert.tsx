import {useState} from 'react';

import Alert from '@code-dot-org/component-library/alert';

/**
 * PL certificates render the account name; without one, download/share is
 * impossible — warn and point at account settings (legacy Certificate.jsx).
 */
export function NameRequiredAlert() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Alert
      link={{href: '/users/edit', text: 'Go to account settings'}}
      onClose={() => setDismissed(true)}
      text="You need to add your full name to your account to download or share this certificate"
      type="warning"
    />
  );
}
