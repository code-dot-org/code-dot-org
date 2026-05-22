/**
 * React context + reducer for the active learner session.
 *
 * The idle timer is kept in a ref so it does not influence render cycles.
 * Activity events are registered once on the window after mount and torn down
 * on unmount; we use the capture phase to catch events before any handler
 * that calls stopPropagation.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { type Session } from '../storage/sessionRepo';
import * as sessionRepo from '../storage/sessionRepo';
import * as prefsStore from '../storage/prefsStore';

// ---------------------------------------------------------------------------
// State and action types
// ---------------------------------------------------------------------------

/** Slice of React state managed by this store. */
interface SessionState {
  /** Currently authenticated session, or null when signed out. */
  activeSession: Session | null;
  /** Milliseconds of inactivity allowed before automatic sign-out. */
  idleTimeoutMs: number;
}

/** Discriminated union of all actions that can mutate SessionState. */
export type SessionAction =
  | { type: 'SET_SESSION'; session: Session }
  | { type: 'CLEAR_SESSION' }
  | { type: 'SET_IDLE_TIMEOUT'; ms: number };

/** Initial state before the async catalog load completes. */
const initialState: SessionState = {
  activeSession: null,
  idleTimeoutMs: 1_200_000,
};

/**
 * Pure reducer for session state.
 * @param state Current state
 * @param action Dispatched action
 * @returns Next state
 */
function sessionReducer(
  state: SessionState,
  action: SessionAction
): SessionState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, activeSession: action.session };
    case 'CLEAR_SESSION':
      return { ...state, activeSession: null };
    case 'SET_IDLE_TIMEOUT':
      return { ...state, idleTimeoutMs: action.ms };
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/** Shape of the value carried by SessionContext. */
interface SessionContextValue {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/** Activity events that reset the idle timer. */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'keydown',
  'touchstart',
  'scroll',
];

/**
 * Provides session state to the subtree and manages the idle-timeout timer.
 * Loads the persisted active session asynchronously on mount.
 * @param children React subtree that may consume session context
 */
// eslint-disable-next-line react-refresh/only-export-components
export function SessionProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // Stable ref so the timer callbacks close over the ref, not stale state.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep idleTimeoutMs accessible inside event callbacks without stale closures.
  const idleTimeoutMsRef = useRef(state.idleTimeoutMs);
  idleTimeoutMsRef.current = state.idleTimeoutMs;

  // Load persisted session + catalog settings on mount.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap(): Promise<void> {
      // Read the catalog blob once for both the active session and the timeout
      // config rather than going through sessionRepo's individual helpers twice.
      const catalog = await prefsStore.get<{
        sessions: Session[];
        activeId: string | null;
        idleTimeoutMs: number;
      }>('nblab.sessionCatalog');

      if (cancelled) return;

      if (catalog !== null) {
        dispatch({ type: 'SET_IDLE_TIMEOUT', ms: catalog.idleTimeoutMs });

        if (catalog.activeId !== null) {
          const active =
            catalog.sessions.find(s => s.id === catalog.activeId) ?? null;
          if (active !== null) {
            dispatch({ type: 'SET_SESSION', session: active });
          }
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Idle timer management.  Reconstructed whenever idleTimeoutMs changes.
  useEffect(() => {
    function scheduleTimeout(): void {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        void sessionRepo.signOut();
        dispatch({ type: 'CLEAR_SESSION' });
      }, idleTimeoutMsRef.current);
    }

    function handleActivity(): void {
      scheduleTimeout();
    }

    scheduleTimeout();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { capture: true });
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity, { capture: true });
      }
    };
  }, [state.idleTimeoutMs]);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Consumer hooks
// ---------------------------------------------------------------------------

/**
 * Returns the current session state.  Must be called inside SessionProvider.
 * @returns SessionState
 */
export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (ctx === null) {
    throw new Error('useSession must be called inside SessionProvider');
  }
  return ctx.state;
}

/**
 * Returns the active Session, throwing if the session is null.
 * Use in components that are only rendered when a session is guaranteed.
 * @returns Active Session
 */
export function useRequireSession(): Session {
  const { activeSession } = useSession();
  if (activeSession === null) {
    throw new Error('useRequireSession: no active session');
  }
  return activeSession;
}

/**
 * Returns a stable callback that activates a session in both the repo and the
 * local reducer, keeping the two in sync.
 * @returns Callback accepting a Session to activate
 */
export function useSetActiveSession(): (session: Session) => void {
  const ctx = useContext(SessionContext);
  if (ctx === null) {
    throw new Error('useSetActiveSession must be called inside SessionProvider');
  }
  const { dispatch } = ctx;

  return (session: Session): void => {
    dispatch({ type: 'SET_SESSION', session });
    void sessionRepo.activateSession(session.id);
  };
}

/**
 * Returns the raw dispatch function for the session reducer.
 *
 * Prefer the purpose-built hooks (`useSetActiveSession`, etc.) where possible.
 * This escape hatch exists for components that need to dispatch actions not yet
 * wrapped in a dedicated hook (e.g. CLEAR_SESSION from SettingsView).
 *
 * Must be called inside SessionProvider.
 * @returns React.Dispatch<SessionAction>
 */
export function useSessionDispatch(): React.Dispatch<SessionAction> {
  const ctx = useContext(SessionContext);
  if (ctx === null) {
    throw new Error('useSessionDispatch must be called inside SessionProvider');
  }
  return ctx.dispatch;
}

export default SessionProvider;

