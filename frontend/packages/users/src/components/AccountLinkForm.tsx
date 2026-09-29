import type {ReactNode} from 'react';

import {resolveCsrfToken} from '@code-dot-org/core/api';

/**
 * A native POST, as on the legacy page: the OAuth request phase and the
 * disconnect action answer with redirects the browser must follow.
 */
export default function AccountLinkForm({
  action,
  children,
}: {
  action: string;
  children: ReactNode;
}) {
  return (
    <form method="post" action={action}>
      <input
        type="hidden"
        name="authenticity_token"
        value={resolveCsrfToken() ?? ''}
      />
      {children}
    </form>
  );
}
