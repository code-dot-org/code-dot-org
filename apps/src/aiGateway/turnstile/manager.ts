import * as Observability from '@code-dot-org/core/plugins/observability';

import {
  CHALLENGE_TIMEOUT_MS,
  CONTAINER_ID,
  LOG,
  TOKEN_MAX_AGE_MS,
  TURNSTILE_SITE_KEY,
} from './constants';
import {debuggerWillPauseInAnonymousScope} from './debuggerProbe';
import {loadTurnstileScript} from './loadScript';
import {type TurnstileMode} from './mode';
import {recordTurnstileOutcome} from './outcome';
import {
  TokenAcquisitionMode,
  TurnstileChallengeError,
  TurnstileDevToolsError,
} from './types';

interface TokenAcquisition {
  mode: TokenAcquisitionMode;
  token: Promise<string>;
}

// Mutable so a caller adopting a pre-fetch can relabel it before it settles.
interface ChallengeOutcomeMode {
  mode: TokenAcquisitionMode;
}

/**
 * Manages Turnstile widget lifecycle with three goals:
 *
 * 1. Serialization — only one widget renders at a time (via promise chain),
 *    so widgetId is always owned by exactly one execution context.
 *
 * 2. Pre-fetch — after each token is delivered, a new challenge starts
 *    immediately in the background. The next call (e.g. main generation
 *    after a safety-check call) receives an already-completing token rather
 *    than waiting for a fresh challenge from scratch.
 *
 * 3. Double-settle prevention — explicit checks before the settle() call in
 *    each branch ensure the timeout and the token callback can never both
 *    fire, and log which race occurred so it is visible in the console.
 *
 * Instantiated lazily via getInstance() — nothing executes until the first
 * call, ensuring zero side effects when the experiment is disabled.
 */
export class TurnstileManager {
  private static instance: TurnstileManager | null = null;

  // Serializes all widget renders — ensures only one challenge runs at a time.
  // The chain always advances even on rejection so queued callers are never
  // permanently blocked.
  private chain: Promise<unknown> = Promise.resolve();

  // Speculatively started challenge from the previous token delivery.
  // Cleared to null immediately when taken so a concurrent synchronous caller
  // cannot claim the same one-time-use token.
  private nextTokenPromise: Promise<string> | null = null;

  // Timestamp (Date.now()) recorded when nextTokenPromise resolved. Used to
  // detect tokens older than TOKEN_MAX_AGE_MS before they are consumed.
  private nextTokenResolvedAt: number | null = null;

  private nextTokenOutcomeMode: ChallengeOutcomeMode | null = null;

  // Enforcement mode of the most recent caller. A pre-fetch is speculative for
  // a request that has not happened yet, so it is attributed to the policy in
  // force when it was scheduled. That is only wrong across a DCDO flip, and
  // only for the one challenge already in flight when the flag changed.
  private enforcement: TurnstileMode = 'monitor';

  private widgetId: string | null = null;

  // Created once in the constructor and appended directly to document.body,
  // placing it outside any React render tree so React's reconciler can never
  // unmount or move it. Stored as a field so all child-count checks always
  // reference the same DOM node.
  private container: HTMLElement;

  private constructor() {
    const container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
    this.container = container;
    console.log(
      `${LOG} TurnstileManager initialized — container appended to body`
    );
  }

  static getInstance(): TurnstileManager {
    if (!TurnstileManager.instance) {
      TurnstileManager.instance = new TurnstileManager();
    }
    return TurnstileManager.instance;
  }

  async getTurnstileToken(enforcement: TurnstileMode): Promise<string> {
    const start = performance.now();
    this.enforcement = enforcement;
    console.log(`${LOG} getTurnstileToken() called (mode=${enforcement})`);

    if (await debuggerWillPauseInAnonymousScope()) {
      console.error(
        '[Turnstile] Challenge blocked: DevTools breakpoints are active on ' +
          'anonymous scripts. Cloudflare Turnstile uses anonymous Web Worker ' +
          'scripts that trigger a debugger statement — if breakpoints are ' +
          'active for these, the challenge cannot complete.'
      );
      console.groupCollapsed('How to fix the Turnstile / DevTools conflict');
      console.log('Option 1: Close DevTools entirely and reload the page.');
      console.log(
        'Option 2: Keep DevTools open — deactivate breakpoints in the Sources panel.'
      );
      console.log(
        '          Click the "Deactivate breakpoints" button in the Sources panel toolbar'
      );
      console.log(
        '          (it looks like a breakpoint circle with a slash through it).'
      );
      console.log(
        '          This disables all breakpoints including debugger statements. Click again to re-enable.'
      );
      console.log('          Keyboard shortcut: Ctrl+F8 on Windows/Linux.');
      console.log(
        '          On Mac: Cmd+F8 requires Fn key (Fn+Cmd+F8) unless you have "Use F1, F2 etc. as'
      );
      console.log(
        '          standard function keys" enabled — clicking the button directly is more reliable.'
      );
      console.log('');
      console.log(
        'NOTE: The DevTools Ignore List does NOT help here. It only applies to the main thread,'
      );
      console.log(
        '      not to Web Worker contexts. Cloudflare Turnstile (and our probe) run inside Blob'
      );
      console.log(
        '      Workers which are isolated contexts — no Ignore List pattern can suppress their'
      );
      console.log('      debugger statements.');
      console.groupEnd();
      console.error(
        `${LOG} Throwing TurnstileDevToolsError — challenge cannot proceed`
      );
      throw new TurnstileDevToolsError();
    }

    // The mode is decided synchronously, before the challenge is awaited, so it
    // can be attached to the span at creation.
    const {mode, token: pendingToken} = this.startTokenAcquisition();

    const awaitTokenDelivery = async (): Promise<string> => {
      try {
        const token = await pendingToken;
        console.log(
          `${LOG} Token delivered successfully (len=${token.length}) in ${(
            performance.now() - start
          ).toFixed(0)}ms`
        );
        return token;
      } catch (err) {
        console.error(
          `${LOG} Token acquisition failed after ${(
            performance.now() - start
          ).toFixed(0)}ms:`,
          err
        );
        throw err;
      }
    };

    return Observability.startSpan(
      {
        name: 'ai-gateway.turnstile',
        op: 'ai.turnstile',
        attributes: {
          'turnstile.acquisition': mode,
          'turnstile.mode': enforcement,
          feature: 'ai-gateway',
        },
      },
      awaitTokenDelivery
    );
  }

  // Starts (or claims) a challenge and reports where the token came from. The
  // returned token is still pending — callers must await it.
  private startTokenAcquisition(): TokenAcquisition {
    if (this.nextTokenPromise) {
      const age =
        this.nextTokenResolvedAt !== null
          ? Date.now() - this.nextTokenResolvedAt
          : null;
      if (age !== null && age > TOKEN_MAX_AGE_MS) {
        console.log(
          `${LOG} Pre-fetch token stale (${(age / 1000).toFixed(
            0
          )}s old) — discarding and starting fresh`
        );
        this.nextTokenPromise = null;
        this.nextTokenResolvedAt = null;
        this.nextTokenOutcomeMode = null;
      } else {
        console.log(
          `${LOG} Pre-fetch hit — returning in-progress token${
            age !== null ? ` (${(age / 1000).toFixed(0)}s old)` : ' (pending)'
          }`
        );
        const p = this.nextTokenPromise;
        // This caller now awaits it, so a failure here is user-visible.
        if (age === null && this.nextTokenOutcomeMode) {
          this.nextTokenOutcomeMode.mode = 'on-demand';
        }
        this.nextTokenPromise = null;
        this.nextTokenResolvedAt = null;
        this.nextTokenOutcomeMode = null;
        this.schedulePrefetch();
        return {mode: 'pre-fetch', token: p};
      }
    }

    console.log(`${LOG} Pre-fetch miss — enqueueing fresh challenge`);
    const result = this.runSerializedChallenge({mode: 'on-demand'});
    result.then(
      () => this.schedulePrefetch(),
      () => {}
    );
    return {mode: 'on-demand', token: result};
  }

  private schedulePrefetch(): void {
    if (this.nextTokenPromise) {
      console.log(`${LOG} Pre-fetch already in flight — skipping`);
      return;
    }
    console.log(`${LOG} Scheduling pre-fetch challenge`);
    const outcomeMode: ChallengeOutcomeMode = {mode: 'pre-fetch'};
    const p = this.runSerializedChallenge(outcomeMode);
    this.nextTokenPromise = p;
    this.nextTokenOutcomeMode = outcomeMode;
    p.then(
      token => {
        this.nextTokenResolvedAt = Date.now();
        console.log(
          `${LOG} Pre-fetch resolved — token ready (len=${token.length})`
        );
      },
      err => {
        // Intentionally swallowed — pre-fetch is speculative. Failure is logged
        // and nextTokenPromise cleared so the next real call retries cleanly.
        console.error(
          `${LOG} Pre-fetch failed — clearing nextTokenPromise:`,
          err
        );
        if (this.nextTokenPromise === p) {
          this.nextTokenPromise = null;
          this.nextTokenResolvedAt = null;
          this.nextTokenOutcomeMode = null;
        }
      }
    );
  }

  private runSerializedChallenge(
    outcomeMode: ChallengeOutcomeMode
  ): Promise<string> {
    console.log(`${LOG} Challenge enqueued on chain`);

    // Captured when the challenge is created rather than read at settle time,
    // so a DCDO flip mid-challenge cannot relabel a challenge that ran under
    // the previous policy.
    const enforcement = this.enforcement;

    // Timed from chain release, not enqueue, to match CHALLENGE_TIMEOUT_MS.
    const startChallenge = () => {
      const start = performance.now();
      return loadTurnstileScript()
        .then(() => this.runChallenge())
        .then(
          token => {
            recordTurnstileOutcome({
              acquisition: outcomeMode.mode,
              enforcement,
              durationMs: performance.now() - start,
            });
            return token;
          },
          error => {
            recordTurnstileOutcome({
              acquisition: outcomeMode.mode,
              enforcement,
              durationMs: performance.now() - start,
              error,
            });
            throw error;
          }
        );
    };

    const result = this.chain.then(
      () => {
        console.log(`${LOG} Challenge starting (chain released)`);
        return startChallenge();
      },
      () => {
        console.log(
          `${LOG} Challenge starting after previous chain error (chain released)`
        );
        return startChallenge();
      }
    );
    // Absorb so the chain always advances for subsequent callers.
    this.chain = result.then(
      () => {},
      () => {}
    );
    return result;
  }

  private runChallenge(): Promise<string> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const settle = (fn: () => void) => {
        if (settled) return;
        settled = true;
        fn();
      };

      console.log(
        `${LOG} runChallenge() start — container has ${this.container.children.length} children, widgetId=${this.widgetId}`
      );

      if (this.widgetId) {
        console.log(
          `${LOG} Removing previous widget (${this.widgetId}) — container has ${this.container.children.length} children`
        );
        try {
          window.turnstile.remove(this.widgetId);
        } catch (err) {
          console.error(`${LOG} remove(${this.widgetId}) threw:`, err);
          this.widgetId = null;
          throw new TurnstileChallengeError(
            'remove_failed',
            'Turnstile failed to remove the previous widget',
            {cause: err}
          );
        }
        this.widgetId = null;

        const afterRemoveCount = this.container.children.length;
        if (afterRemoveCount > 0) {
          console.warn(
            `${LOG} WARNING: container has ${afterRemoveCount} children after remove() — cleanup may have failed`
          );
        } else {
          console.log(`${LOG} Container clear after remove()`);
        }
      }

      const beforeRenderCount = this.container.children.length;
      if (beforeRenderCount > 0) {
        console.warn(
          `${LOG} WARNING: container has ${beforeRenderCount} children before render() — widget accumulation risk`
        );
      }

      const timeout = setTimeout(() => {
        if (settled) {
          console.log(
            `${LOG} Timeout fired after token already delivered — no-op`
          );
          return;
        }
        console.error(
          `${LOG} TIMEOUT: challenge timed out after 30s — widgetId=${this.widgetId}, container has ${this.container.children.length} children — removing widget`
        );
        settle(() => {
          if (this.widgetId) {
            try {
              window.turnstile.remove(this.widgetId);
            } catch (removeErr) {
              console.error(
                `${LOG} remove() in timeout handler threw:`,
                removeErr
              );
            }
            this.widgetId = null;
          }
          reject(
            new TurnstileChallengeError(
              'timeout',
              'Turnstile challenge timed out'
            )
          );
        });
      }, CHALLENGE_TIMEOUT_MS);

      // renderTime is initialized to 0 and updated synchronously after render()
      // returns. The callback always fires asynchronously so renderTime is
      // guaranteed to hold the correct value by the time it is read.
      let renderTime = 0;

      console.log(`${LOG} Calling turnstile.render()`);
      let widgetId: string;
      try {
        widgetId = window.turnstile.render(this.container, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => {
            if (settled) {
              console.warn(
                `${LOG} Token callback fired after 30s timeout — token discarded (len=${token.length})`
              );
              return;
            }
            console.log(
              `${LOG} Token callback fired — len=${token.length}, ${(
                performance.now() - renderTime
              ).toFixed(0)}ms since render()`
            );
            settle(() => {
              clearTimeout(timeout);
              resolve(token);
            });
          },
        });
      } catch (err) {
        console.error(`${LOG} render() threw:`, err);
        clearTimeout(timeout);
        throw new TurnstileChallengeError(
          'render_threw',
          'Turnstile render() threw',
          {cause: err}
        );
      }

      renderTime = performance.now();

      console.log(
        `${LOG} render() returned widgetId=${widgetId}, container has ${this.container.children.length} children`
      );

      if (!widgetId) {
        console.error(`${LOG} render() returned falsy widgetId — rejecting`);
        settle(() => {
          clearTimeout(timeout);
          reject(
            new TurnstileChallengeError(
              'render_failed',
              'Turnstile failed to render widget'
            )
          );
        });
      } else {
        this.widgetId = widgetId;
      }
    });
  }
}
