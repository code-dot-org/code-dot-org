import {type Locator} from '@playwright/test';

import {cssColorsMatchVars} from './colors';

/** A progress bubble's rendered state, named for the DSCO tokens progress.rb keys on. */
export type ProgressBubbleState = 'perfect' | 'not_tried' | 'attempted';

/**
 * Background + top-border DSCO tokens that define each bubble state. `perfect`
 * borders in its own fill color: progressStyles.js draws every success-status
 * border with --background-success-primary rather than
 * --borders-success-primary, so the two lighter greens cannot form a ring.
 * `attempted` (an incorrect run, not yet solved) pairs not_tried's background
 * with perfect's border — a third, distinct color combination confirmed live
 * (white fill, green top border) — see progress.rb verify_progress's
 * 'attempted' branch.
 */
const STATE_TOKENS: Record<
  ProgressBubbleState,
  {background: string; border: string}
> = {
  perfect: {
    background: '--background-success-primary',
    border: '--background-success-primary',
  },
  not_tried: {
    background: '--background-neutral-primary',
    border: '--borders-neutral-primary',
  },
  attempted: {
    background: '--background-neutral-primary',
    border: '--background-success-primary',
  },
};

/**
 * Whether `bubble` shows `state`, the way progress.rb verify_progress does (it
 * keys off color): its background and top-border colors match the state's DSCO
 * tokens.
 */
export async function progressBubbleShows({
  bubble,
  state,
}: {
  bubble: Locator;
  state: ProgressBubbleState;
}): Promise<boolean> {
  const {background, border} = STATE_TOKENS[state];
  return cssColorsMatchVars({
    locator: bubble,
    matches: [
      {property: 'background-color', cssVar: background},
      {property: 'border-top-color', cssVar: border},
    ],
  });
}
