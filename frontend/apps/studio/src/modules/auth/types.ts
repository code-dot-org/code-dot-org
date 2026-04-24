import type {CurrentUserResponseSignedIn} from '@code-dot-org/core/api';

/** Re-exported for consumers that need the signed-in user shape without importing from core directly. */
export type {CurrentUserResponseSignedIn};

/**
 * Four-case discriminated union returned by {@link useAuth}.
 * Every consumer must exhaustively switch on `status`.
 */
export type AuthOutcome =
  | {status: 'loading'}
  | ({status: 'signedIn'} & CurrentUserResponseSignedIn)
  | {status: 'signedOut'}
  | {status: 'error'; onRetry: () => void; observabilityEventId?: string};
