import {type Locator} from '@playwright/test';

import {cssColorsMatchVars} from './colors';

/** A progress bubble's rendered state, named for the DSCO tokens progress.rb keys on. */
export type ProgressBubbleState = 'perfect' | 'not_tried';

/**
 * Background and, where it distinguishes the state, top-border DSCO tokens.
 * `perfect` has no border token: progressStyles.js paints that bubble with a
 * transparent border, so only the background identifies it.
 */
const STATE_TOKENS: Record<
  ProgressBubbleState,
  {background: string; border?: string}
> = {
  perfect: {
    background: '--background-success-primary',
  },
  not_tried: {
    background: '--background-neutral-primary',
    border: '--borders-neutral-primary',
  },
};

/**
 * Whether `bubble` shows `state`, the way progress.rb verify_progress does (it
 * keys off color): its background, and its top-border color where the state
 * defines one, match the state's DSCO tokens.
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
      ...(border ? [{property: 'border-top-color', cssVar: border}] : []),
    ],
  });
}
