import type {CurrentUserResponseSignedIn} from '@code-dot-org/core/api';

export type {CurrentUserResponseSignedIn};

/**
 * Four-case discriminated union returned by {@link useAuth}.
 * Every consumer must exhaustively switch on `status`.
 */
export type AuthOutcome =
  | {status: 'loading'}
  | ({status: 'signed-in'} & CurrentUserResponseSignedIn)
  | {status: 'signed-out'}
  | {status: 'error'; onRetry: () => void; eventId?: string};
