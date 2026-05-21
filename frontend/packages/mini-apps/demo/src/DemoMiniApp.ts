import type {ComponentType} from 'react';

import type {
  MiniApp,
  MiniAppDeps,
  MiniAppPreviewProps,
} from '@code-dot-org/mini-app-base';

import DemoPreview from './DemoPreview';

export const DEMO_NAME = 'demo';
export const DEMO_SIGNAL_TAG = '[DEMO]';

/**
 * Minimal `MiniApp` implementation. Exists to validate the abstraction
 * by being the second consumer of `MiniApp` alongside Neighborhood — no
 * skin loader, no orchestration context, no signal payloads. Every
 * method is a stub.
 *
 * If a future mini-app needs real behavior, this class is a useful
 * template; the bare interface satisfaction lives here as a regression
 * guard against the abstraction drifting toward Neighborhood-specific
 * assumptions.
 */
export class DemoMiniApp implements MiniApp {
  readonly name = DEMO_NAME;
  readonly signalTag = DEMO_SIGNAL_TAG;
  readonly PreviewComponent: ComponentType<MiniAppPreviewProps> = DemoPreview;

  // Deps are accepted to satisfy the factory signature in
  // `miniAppRegistry`. A real mini-app would close over them in its
  // signal handlers; the stub simply ignores them.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_deps: MiniAppDeps) {}

  // No signal protocol is wired up — every stdout line is "not a demo
  // signal" from this mini-app's perspective.
  parseSignal(): null {
    return null;
  }

  handleSignal(): void {}
  onRun(): void {}
  onStop(): void {}
  onClose(): void {}
  reset(): void {}

  waitUntilDone(): Promise<void> {
    return Promise.resolve();
  }
}

export default DemoMiniApp;
