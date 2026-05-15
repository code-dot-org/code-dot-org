import type {ComponentType} from 'react';

/**
 * Props passed to a mini-app's preview component by the codebridge runtime.
 * Kept narrow; mini-apps that need more should accept it via their own
 * factory `deps` instead.
 */
export interface MiniAppPreviewProps {
  handleScaling?: boolean;
}

/**
 * Console + run-state callbacks that codebridge supplies to a mini-app at
 * construction time. Mini-apps that need more (redux dispatch, level
 * properties, etc.) declare their own deps type that extends this one.
 */
export interface MiniAppDeps {
  onOutputMessage: (message: string) => void;
  onNewlineMessage: () => void;
  onPartialOutputMessage: (message: string) => void;
  setIsRunning: (isRunning: boolean) => void;
}

/**
 * Contract codebridge expects from a mini-app implementation.
 *
 * Lifecycle: `onRun` brackets a program run, `onStop` cancels an in-flight
 * run, `onClose` signals "no more input coming, drain the queue", and
 * `reset` returns the visualization to its initial state.
 *
 * Wire protocol: the runner reads stdout lines from the Python worker;
 * any line starting with `signalTag` is passed to `parseSignal` and then
 * to `handleSignal`. The envelope format is `[TAG] KEY [JSON]` — see
 * `parseSignalEnvelope` in `./signalEnvelope`.
 */
export interface MiniApp<Signal = unknown> {
  /** Identifier matching `labConfig.miniApp.name`. */
  readonly name: string;

  /** The full stdout tag this mini-app emits, e.g. "[NEIGHBORHOOD]". */
  readonly signalTag: string;

  /**
   * Parse one stdout line into a typed signal. Return null to skip the
   * line (the runner logs and continues).
   */
  parseSignal(line: string): Signal | null;

  /** Queue a parsed signal for processing. */
  handleSignal(signal: Signal): void;

  /** Called once before each program run. */
  onRun(): void;

  /** Called when the user stops or the program crashes. */
  onStop(): void;

  /** Called when no further signals will arrive; flush the queue. */
  onClose(): void;

  /** Return the visualization to its initial state. */
  reset(): void;

  /** Resolves when all queued signals have been processed. */
  waitUntilDone(): Promise<void>;

  /**
   * Optional: translate a Python traceback's
   * `<MiniApp>RuntimeException: KEY` line into a friendly user message.
   * Return null when the traceback is not from this mini-app.
   */
  parseException?(traceback: string): string | null;

  /**
   * Optional: the DOM element codebridge should screenshot for the
   * project thumbnail. Called after a successful run. Returning null
   * skips the capture. The package exposes which element represents
   * the visualization; codebridge owns the conversion pipeline (SVG →
   * canvas → blob → save) because those helpers and the cropping scale
   * live on the apps side.
   */
  getThumbnailElement?(): Element | null;

  /**
   * Optional: preview scaling factor codebridge should apply when laying
   * out the panel. Returning undefined keeps the default.
   */
  getPreviewScale?(): number | undefined;

  /** The React component codebridge renders inside the preview panel. */
  PreviewComponent: ComponentType<MiniAppPreviewProps>;
}

/**
 * A mini-app constructor exposed to codebridge's static registry. The
 * `TDeps` parameter lets a mini-app widen the dep shape (e.g. to accept
 * a redux dispatch) while staying assignable to a generic factory map.
 */
export type MiniAppFactory<TDeps extends MiniAppDeps = MiniAppDeps> = (
  deps: TDeps,
) => MiniApp;
