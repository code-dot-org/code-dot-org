import {useRef, type ReactNode} from 'react';

import {resolveCsrfToken} from '@code-dot-org/core/api';

/**
 * A native POST: the OAuth request phase and the
 * disconnect action answer with redirects the browser must follow.
 */
export default function AccountLinkForm({
  action,
  children,
}: {
  action: string;
  children: ReactNode;
}) {
  const tokenRef = useRef<HTMLInputElement>(null);

  // Read again at submit: the session token can rotate after render.
  const refreshToken = () => {
    tokenRef.current!.value = resolveCsrfToken() ?? '';
  };

  return (
    <form method="post" action={action} onSubmit={refreshToken}>
      <input
        ref={tokenRef}
        type="hidden"
        name="authenticity_token"
        defaultValue={resolveCsrfToken() ?? ''}
      />
      {children}
    </form>
  );
}
