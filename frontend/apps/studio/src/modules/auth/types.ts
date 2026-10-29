import type {CurrentUserResponseSignedIn} from '@code-dot-org/core/api';

/** Re-exported for consumers that need the signed-in user shape without importing from core directly. */
export type {CurrentUserResponseSignedIn};

/**
 * Three-case discriminated union returned by {@link useAuth}.
 * `loading` is absent: auth resolves before any component renders via the
 * root route's `beforeLoad`. Every consumer must exhaustively switch on `status`.
 */
export type AuthOutcome =
  | ({status: 'signed-in'} & CurrentUserResponseSignedIn)
  | {status: 'signed-out'}
  | {status: 'error'; observabilityEventId?: string};
