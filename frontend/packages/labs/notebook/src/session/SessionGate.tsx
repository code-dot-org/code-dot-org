/**
 * SessionGate — renders children only when a session is active.
 *
 * When no session is active the gate substitutes `<SessionPicker>`, which
 * lets the learner start a new session or resume an existing one.  On
 * activation `onSessionReady` is wired to `setActiveSession` from the store
 * so both the React state and the persisted catalog are updated atomically.
 *
 * Typical placement: wrap the entire lab UI just inside SessionProvider.
 *
 *   <SessionProvider>
 *     <SessionGate>
 *       <LabContent />
 *     </SessionGate>
 *   </SessionProvider>
 */

import {type ReactNode} from 'react';
import {useSession, useSetActiveSession} from './sessionStore';
import {SessionPicker} from './SessionPicker';
import type {Session} from '../storage/sessionRepo';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for SessionGate. */
export interface SessionGateProps {
  /** Content to render when a session is active. */
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Guards its children behind an active session check.
 *
 * Renders `<SessionPicker>` until a session is active, then transparently
 * renders children without any wrapper DOM element.
 */
export function SessionGate({children}: SessionGateProps): React.ReactElement {
  const {activeSession} = useSession();
  const setActiveSession = useSetActiveSession();

  /**
   * Invoked by SessionPicker once a session has been created or activated.
   * Forwards the session to the store so both React state and the persisted
   * catalog are updated.
   * @param session Newly activated session
   */
  function handleSessionReady(session: Session): void {
    setActiveSession(session);
  }

  if (activeSession === null) {
    return <SessionPicker onSessionReady={handleSessionReady} />;
  }

  return <>{children}</>;
}
