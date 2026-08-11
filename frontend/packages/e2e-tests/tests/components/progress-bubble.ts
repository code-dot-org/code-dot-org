import {type Locator} from '@playwright/test';

import {cssColorsMatchVars} from '../shared/colors';

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
 * A single progress bubble: the same React component the lesson header strip
 * and the unit overview's summary table both render. The two surfaces nest
 * their bubbles differently, so pages keep the addressing and hand back one of
 * these; this owns only what a bubble means once you have one.
 */
export class ProgressBubble {
  /** The bubble element itself, for visibility/DOM assertions. */
  readonly locator: Locator;

  constructor(locator: Locator) {
    this.locator = locator;
  }

  /**
   * Whether the bubble renders `state`, the way progress.rb verify_progress
   * does (it keys off color): its background and top-border colors match the
   * state's DSCO tokens.
   */
  async shows(state: ProgressBubbleState): Promise<boolean> {
    const {background, border} = STATE_TOKENS[state];
    return cssColorsMatchVars({
      locator: this.locator,
      matches: [
        {property: 'background-color', cssVar: background},
        {property: 'border-top-color', cssVar: border},
      ],
    });
  }
}
