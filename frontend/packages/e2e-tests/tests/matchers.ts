import {
  type ProgressBubble,
  type ProgressBubbleState,
} from './components/progress-bubble';

/** Milestone POSTs and the progress re-fetch settle well past the suite's default expect timeout. */
const PROGRESS_TIMEOUT_MS = 30_000;

interface ProgressMatcherOptions {
  timeout?: number;
}

type BaseExpect = typeof import('@playwright/test').expect;

/**
 * Adds `toShowProgress`, which retries until the bubble renders the expected
 * state and names the state it actually found when it does not.
 */
export function extendExpect<T extends BaseExpect>(baseExpect: T) {
  return baseExpect.extend({
    async toShowProgress(
      bubble: ProgressBubble,
      expected: ProgressBubbleState,
      options: ProgressMatcherOptions = {},
    ) {
      const timeout = options.timeout ?? PROGRESS_TIMEOUT_MS;
      let actual: ProgressBubbleState | 'unknown' = 'unknown';

      try {
        await baseExpect
          .poll(async () => (actual = await bubble.state()), {timeout})
          .toBe(expected);
      } catch {
        return {
          pass: false,
          actual,
          message: () =>
            `Expected progress bubble to show "${expected}", but it showed ` +
            `"${actual}" after ${timeout}ms.`,
        };
      }

      return {
        pass: true,
        actual,
        message: () => `Expected progress bubble not to show "${expected}".`,
      };
    },
  });
}
