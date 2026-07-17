import {type Locator} from '@playwright/test';

import {cssColorsMatchVars} from './colors';

/** A progress bubble's rendered state, named for the DSCO tokens progress.rb keys on. */
export type ProgressBubbleState = 'perfect' | 'not_tried';

/** Background + top-border DSCO tokens that define each bubble state. */
const STATE_TOKENS: Record<
  ProgressBubbleState,
  {background: string; border: string}
> = {
  perfect: {
    background: '--background-success-primary',
    border: '--borders-success-primary',
  },
  not_tried: {
    background: '--background-neutral-primary',
    border: '--borders-neutral-primary',
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
