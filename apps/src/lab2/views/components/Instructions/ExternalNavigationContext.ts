import React, {createContext} from 'react';

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
  /** Icon after the label; defaults to the lesson's own, an arrow when a level follows. */
  endIcon?: React.ReactNode;
  onContinue: () => void;
  /**
   * When set, the continue button is rendered inside a bordered card with
   * a heading and body line above it (e.g. the adaptive project's skill-map
   * nudge box).
   */
  callout?: {heading: string; body: string};
}

export const ExternalNavigationContext =
  createContext<ExternalNavigation | null>(null);
