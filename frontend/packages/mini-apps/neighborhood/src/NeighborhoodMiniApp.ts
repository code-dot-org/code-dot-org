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
 * Neighborhood implementation of the `MiniApp` contract. Wraps the
 * existing `Neighborhood` signal-queue class so codebridge can talk to
 * one polymorphic object regardless of which mini-app is mounted.
 *
 * The class itself owns the signal queue and lifecycle; the preview
 * component (and, in a follow-up, MazeController orchestration) renders
 * the visualization that those signals animate.
 */
export class NeighborhoodMiniApp
  implements MiniApp<NeighborhoodSignal | ConsoleSignal>
{
  readonly name = NEIGHBORHOOD_NAME;
  readonly signalTag = NEIGHBORHOOD_SIGNAL_TAG;
  readonly PreviewComponent: ComponentType<MiniAppPreviewProps> =
    NeighborhoodPreview;

  private readonly neighborhood: Neighborhood;

  constructor(deps: MiniAppDeps) {
    this.neighborhood = new Neighborhood(
      deps.onOutputMessage,
      deps.onNewlineMessage,
      deps.setIsRunning,
      deps.onPartialOutputMessage,
    );
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
   * MazeController boot — exposes the inner Neighborhood so the
   * preview's effect can call `afterInject(...)`. Will go away once that
   * lives inside `NeighborhoodPreview`.
   */
  getNeighborhood(): Neighborhood {
    return this.neighborhood;
  }
}

export default NeighborhoodMiniApp;
