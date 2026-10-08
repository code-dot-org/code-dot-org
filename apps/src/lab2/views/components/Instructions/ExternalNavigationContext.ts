import {createContext} from 'react';

/**
 * Navigation supplied from outside the lab, in place of continuing to the
 * next level of the lesson. Used when a lab is rendered in a nested or modular
 * context (e.g. Music Dance AI, Adaptive) so that navigation is owned by the host
 * rather than the Lab2 framework.
 */
export interface ExternalNavigation {
  /** Button text; defaults to Continue, or Finish on a lesson's last level. */
  label?: string;
  enabled: boolean;
  /** Shown on the disabled button. */
  tooltip?: string;
  onContinue: () => void;
}

export const ExternalNavigationContext =
  createContext<ExternalNavigation | null>(null);
