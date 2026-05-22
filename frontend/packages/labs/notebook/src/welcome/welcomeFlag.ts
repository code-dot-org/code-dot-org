/**
 * welcomeFlag — per-session flag tracking whether the welcome notebook
 * has been shown to the learner.
 *
 * The flag is stored via prefsStore so it survives page reloads but is
 * scoped to the session, keeping sessions independent of each other.
 */

import * as prefsStore from '../storage/prefsStore';

/**
 * Returns the prefs key for the welcome flag for a given session.
 * @param sessionId Session identifier
 * @returns Prefs key string
 */
function welcomeKey(sessionId: string): string {
  return `nblab.welcome.shown.${sessionId}`;
}

/**
 * Returns true if the welcome notebook has been shown in this session.
 * @param sessionId Session identifier
 * @returns Promise resolving to true when the flag is set
 */
export async function hasSeenWelcome(sessionId: string): Promise<boolean> {
  const value = await prefsStore.get<boolean>(welcomeKey(sessionId));
  return value === true;
}

/**
 * Records that the welcome notebook has been shown in this session.
 * @param sessionId Session identifier
 */
export async function markWelcomeSeen(sessionId: string): Promise<void> {
  await prefsStore.set<boolean>(welcomeKey(sessionId), true);
}

/**
 * Clears the welcome flag — used by "Show me the welcome again" in Settings.
 * @param sessionId Session identifier
 */
export async function clearWelcomeSeen(sessionId: string): Promise<void> {
  await prefsStore.remove(welcomeKey(sessionId));
}
