import type {ComponentType} from 'react';

import type {
  MiniApp,
  MiniAppDeps,
  MiniAppPreviewProps,
} from '@code-dot-org/mini-app-base';

import {NEIGHBORHOOD_NAME, NEIGHBORHOOD_SIGNAL_TAG} from './constants';
import Neighborhood from './Neighborhood';
import NeighborhoodPreview from './NeighborhoodPreview';
import {parseNeighborhoodException} from './parseNeighborhoodException';
import {parseNeighborhoodSignal} from './parseNeighborhoodSignal';
import type {ConsoleSignal, NeighborhoodSignal} from './types';

/**
 * Structural shape of the underlying signal-queue object. The package's
 * own `Neighborhood` class satisfies this — and so does the
 * pre-migration copy at `apps/src/miniApps/neighborhood/Neighborhood.ts`,
 * which lets codebridge wrap its existing instance while the migration
 * is in flight. Once that legacy copy is gone, this interface and the
 * `Neighborhood` class collapse back into one type.
 */
export interface NeighborhoodLike {
  handleSignal(signal: NeighborhoodSignal | ConsoleSignal | null): void;
  onRun(): void;
  onStop(): void;
  onClose(): void;
  reset(): void;
  waitUntilDone(): Promise<void>;
  /**
   * Boot the MazeController against the rendered SVG and start the
   * level. Signature is intentionally permissive — codebridge passes
   * shapes assembled from level/skin data it owns, and the inner
   * Neighborhood validates them at runtime. Once orchestration moves
   * inside the package this leaves `NeighborhoodLike` and becomes a
   * private detail.
   */
  afterInject(...args: unknown[]): void;
}

function isNeighborhoodLike(
  arg: MiniAppDeps | NeighborhoodLike,
): arg is NeighborhoodLike {
  return typeof (arg as NeighborhoodLike).handleSignal === 'function';
}

/**
 * Neighborhood implementation of the `MiniApp` contract. Wraps a
 * `Neighborhood` signal-queue so codebridge can talk to one polymorphic
 * object regardless of which mini-app is mounted.
 *
 * Two construction modes:
 *
 *   - `new NeighborhoodMiniApp(deps)` — the production path. Constructs
 *     a fresh `Neighborhood` from the package using the codebridge
 *     callbacks in `MiniAppDeps`.
 *
 *   - `new NeighborhoodMiniApp(existingNeighborhood)` — the migration
 *     path. Adopts a pre-built instance (the legacy
 *     `apps/src/miniApps/neighborhood/Neighborhood`) so codebridge can
 *     register a MiniApp alongside the legacy slot without
 *     double-allocating state.
 */
export class NeighborhoodMiniApp
  implements MiniApp<NeighborhoodSignal | ConsoleSignal>
{
  readonly name = NEIGHBORHOOD_NAME;
  readonly signalTag = NEIGHBORHOOD_SIGNAL_TAG;
  readonly PreviewComponent: ComponentType<MiniAppPreviewProps> =
    NeighborhoodPreview;

  private readonly neighborhood: NeighborhoodLike;

  // Order matters: the legacy Neighborhood has private fields with the
  // same names as `MiniAppDeps` properties, which would make TS pick
  // the deps overload first and then reject the access. Probing for
  // `handleSignal` first selects the adopt path cleanly.
  constructor(neighborhood: NeighborhoodLike);
  constructor(deps: MiniAppDeps);
  constructor(arg: MiniAppDeps | NeighborhoodLike) {
    if (isNeighborhoodLike(arg)) {
      this.neighborhood = arg;
    } else {
      this.neighborhood = new Neighborhood(
        arg.onOutputMessage,
        arg.onNewlineMessage,
        arg.setIsRunning,
        arg.onPartialOutputMessage,
      );
    }
  }

  parseSignal(line: string) {
    return parseNeighborhoodSignal(line);
  }

  parseException(traceback: string) {
    return parseNeighborhoodException(traceback);
  }

  handleSignal(signal: NeighborhoodSignal | ConsoleSignal) {
    this.neighborhood.handleSignal(signal);
  }

  onRun() {
    this.neighborhood.onRun();
  }

  onStop() {
    this.neighborhood.onStop();
  }

  onClose() {
    this.neighborhood.onClose();
  }

  reset() {
    this.neighborhood.reset();
  }

  waitUntilDone(): Promise<void> {
    return this.neighborhood.waitUntilDone();
  }

  /**
   * Escape hatch for codebridge orchestration code that still owns the
   * MazeController boot — exposes the inner Neighborhood-shaped object
   * so the preview's effect can call `afterInject(...)`. Will go away
   * once that lives inside `NeighborhoodPreview`.
   */
  getNeighborhood(): NeighborhoodLike {
    return this.neighborhood;
  }
}

export default NeighborhoodMiniApp;
