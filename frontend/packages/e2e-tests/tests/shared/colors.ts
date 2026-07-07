import {type Locator} from '@playwright/test';

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
 * Whether `bubble`'s computed background and top-border colors match the DSCO
 * tokens for `state`, the way progress.rb verify_progress does (it keys off
 * color). getComputedStyle returns resolved values, not the vars that produced
 * them, so resolve each token via a probe in the bubble's own theme context and
 * compare rgb() to rgb() — both properties in one evaluate.
 */
export async function progressBubbleShows({
  bubble,
  state,
}: {
  bubble: Locator;
  state: ProgressBubbleState;
}): Promise<boolean> {
  return bubble.evaluate((el, tokens) => {
    const resolve = (cssVar: string): string => {
      const probe = document.createElement('span');
      el.appendChild(probe);
      probe.style.color = `var(${cssVar})`;
      const value = window.getComputedStyle(probe).color;
      probe.remove();
      return value;
    };
    const style = window.getComputedStyle(el);
    return (
      style.getPropertyValue('background-color') ===
        resolve(tokens.background) &&
      style.getPropertyValue('border-top-color') === resolve(tokens.border)
    );
  }, STATE_TOKENS[state]);
}
