import {useEffect} from 'react';

import {
  clearLabContext,
  setLabContext,
  type LabContextSnapshot,
} from './labContextRegistry';

/**
 * Per-lab-stage hook: register what the student is working on so the AI
 * Tutor can read it. The lab stage passes a `getSnapshot` callback that
 * returns a fresh snapshot (typically: current Blockly-generated code +
 * step instructions). The hook polls it lightly so the registry stays
 * fresh as the workspace changes, and clears on unmount.
 *
 * Polling is intentional — the lab packages (music/maze/datasci/ai-trainer)
 * don't expose a "workspace changed" event up to the host, and adding one
 * per lab would require touching all four. A 1s poll is cheap, generates
 * the simple-flavored code via `getAllGeneratedCode`, and is plenty
 * responsive for "ask the tutor what's wrong with my code."
 */
export function useRegisterLabContext(
  getSnapshot: () => LabContextSnapshot,
  pollIntervalMs = 1000,
): void {
  useEffect(() => {
    // Publish once immediately so the tutor has something to read even if
    // the student opens the panel before the first poll fires.
    setLabContext(getSnapshot());

    const id = window.setInterval(() => {
      setLabContext(getSnapshot());
    }, pollIntervalMs);

    return () => {
      window.clearInterval(id);
      clearLabContext();
    };
    // We deliberately ignore changes to `getSnapshot` between renders — the
    // function captures live refs from the calling component, and we want
    // a single steady poll across the lifetime of the lab stage.

  }, []);
}
