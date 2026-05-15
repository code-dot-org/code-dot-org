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
 * Neighborhood implementation of the `MiniApp` contract. Owns a
 * `Neighborhood` signal queue so codebridge can talk to one polymorphic
 * object regardless of which mini-app is mounted.
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
   * Boot the MazeController against the rendered SVG and feed in the
   * level + skin + serialized maze. Called by the package's
   * `NeighborhoodPreview` after mount, once codebridge has supplied the
   * inputs through `NeighborhoodInputsContext`. Signature stays
   * permissive — the inner `Neighborhood.afterInject` validates the
   * shapes at runtime.
   */
  afterInject(...args: unknown[]): void {
    // The inner method has a strict typed signature; the wrapper stays
    // permissive at the codebridge boundary, so we cast through here.
    (this.neighborhood.afterInject as (...a: unknown[]) => void)(...args);
  }
}

export default NeighborhoodMiniApp;
