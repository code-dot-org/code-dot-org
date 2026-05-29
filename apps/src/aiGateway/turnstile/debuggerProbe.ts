import {DEBUGGER_PROBE_TIMEOUT_MS, LOG} from './constants';

/**
 * Detects whether a `debugger` statement inside an anonymous Web Worker script
 * would be paused by DevTools — the same context Turnstile uses for its own
 * anti-bot debugger call.
 *
 * The probe Worker fires `debugger` then immediately posts a message. If
 * DevTools is pausing on anonymous scripts the Worker will be suspended and
 * the message will never arrive within the timeout. When the timeout fires we
 * terminate the Worker (which clears the DevTools pause automatically) and
 * resolve true. The main thread is never blocked — the user never has to click
 * Resume for our probe.
 *
 * Returns false (safe to proceed) when:
 *   - DevTools is closed
 *   - Breakpoints are deactivated (Ctrl+F8)
 *   - Worker / Blob URL creation is blocked by CSP (can't detect → assume safe)
 */
export function debuggerWillPauseInAnonymousScope(): Promise<boolean> {
  return new Promise(resolve => {
    let worker: Worker | null = null;
    let blobUrl: string | null = null;
    let settled = false;
    const start = performance.now();

    const settle = (willPause: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker?.terminate();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      resolve(willPause);
    };

    console.log(`${LOG} DevTools probe started`);

    const timer = setTimeout(() => {
      console.warn(
        `${LOG} DevTools probe: breakpoints detected (${(
          performance.now() - start
        ).toFixed(1)}ms) — challenge will be blocked`
      );
      settle(true);
    }, DEBUGGER_PROBE_TIMEOUT_MS);

    try {
      blobUrl = URL.createObjectURL(
        new Blob(['debugger; postMessage("ok");'], {
          type: 'application/javascript',
        })
      );
      worker = new Worker(blobUrl);
      worker.onmessage = () => {
        console.log(
          `${LOG} DevTools probe: no breakpoints detected (${(
            performance.now() - start
          ).toFixed(1)}ms)`
        );
        settle(false);
      };
      worker.onerror = event => {
        // Intentionally swallowed — a Worker error is not a DevTools pause,
        // so we assume safe and let the Turnstile challenge proceed.
        console.warn(
          `${LOG} DevTools probe worker error — assuming safe:`,
          event
        );
        settle(false);
      };
    } catch (err) {
      // Intentionally swallowed — CSP or unsupported environment means we
      // cannot probe, so we assume safe and let the Turnstile challenge proceed.
      console.warn(
        `${LOG} DevTools probe blocked by CSP or unsupported environment — assuming safe:`,
        err
      );
      settle(false);
    }
  });
}
