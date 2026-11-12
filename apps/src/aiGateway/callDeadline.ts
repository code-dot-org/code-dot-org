/**
 * The AI SDK's `timeout` and `abortSignal` for one gateway call. Expiry
 * rejects as the SDK's own timeout does, with a DOMException named
 * TimeoutError, so callers handle both alike.
 */
export interface CallDeadline {
  readonly signal: AbortSignal;
  /** Starts the timer, or starts it over. */
  restartTimer(): void;
  stopTimer(): void;
  /** Rejects with the abort reason if the call is aborted first. */
  race<T>(work: Promise<T>): Promise<T>;
  dispose(): void;
}

// AbortSignal.any is newer than the browsers we support, so the caller's
// signal is forwarded by hand.
export function createCallDeadline(
  timeoutMs: number | undefined,
  abortSignal: AbortSignal | undefined
): CallDeadline {
  const controller = new AbortController();
  const forwardAbort = () => controller.abort(abortSignal?.reason);
  if (abortSignal?.aborted) {
    forwardAbort();
  } else {
    abortSignal?.addEventListener('abort', forwardAbort, {once: true});
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const clearTimer = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return {
    signal: controller.signal,

    restartTimer() {
      clearTimer();
      if (timeoutMs === undefined || controller.signal.aborted) {
        return;
      }
      timer = setTimeout(
        () =>
          controller.abort(
            new DOMException(
              `AI gateway call timed out after ${timeoutMs}ms`,
              'TimeoutError'
            )
          ),
        timeoutMs
      );
    },

    stopTimer: clearTimer,

    race<T>(work: Promise<T>): Promise<T> {
      const {signal} = controller;
      if (signal.aborted) {
        work.catch(() => {});
        return Promise.reject(signal.reason);
      }
      return new Promise<T>((resolve, reject) => {
        const onAbort = () => reject(signal.reason);
        signal.addEventListener('abort', onAbort, {once: true});
        work.then(
          value => {
            signal.removeEventListener('abort', onAbort);
            resolve(value);
          },
          error => {
            signal.removeEventListener('abort', onAbort);
            reject(error);
          }
        );
      });
    },

    dispose() {
      clearTimer();
      abortSignal?.removeEventListener('abort', forwardAbort);
    },
  };
}
