import type {ComponentType} from 'react';

import type {
  MiniApp,
  MiniAppDeps,
  MiniAppPreviewProps,
} from '@code-dot-org/mini-app-base';
import {svgToCanvas} from '@code-dot-org/mini-app-base/svg';

import {NEIGHBORHOOD_NAME, NEIGHBORHOOD_SIGNAL_TAG, SVG_ID} from './constants';
import Neighborhood from './Neighborhood';
import NeighborhoodPreview from './NeighborhoodPreview';
import {parseNeighborhoodException} from './parseNeighborhoodException';
import {parseNeighborhoodSignal} from './parseNeighborhoodSignal';
import type {
  ConsoleSignal,
  GetTestResults,
  LoadAudio,
  NeighborhoodConfig,
  NeighborhoodLevelProperties,
  NeighborhoodSignal,
  PlayAudio,
  PlayAudioOnFailure,
  SkinType,
} from './types';

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
   * inputs through `NeighborhoodInputsContext`. Mirrors the inner
   * `Neighborhood.afterInject` signature — Python lab passes no-ops for
   * the audio + test-result callbacks; Java lab (legacy, not on this
   * path) supplied real handlers.
   */
  afterInject(
    level: NeighborhoodLevelProperties,
    skin: SkinType,
    config: NeighborhoodConfig,
    playAudio: PlayAudio,
    playAudioOnFailure: PlayAudioOnFailure,
    loadAudio: LoadAudio,
    getTestResults: GetTestResults,
  ): void {
    this.neighborhood.afterInject(
      level,
      skin,
      config,
      playAudio,
      playAudioOnFailure,
      loadAudio,
      getTestResults,
    );
  }

  /**
   * Rasterize the MazeController's SVG into a canvas for codebridge's
   * thumbnail pipeline. Returns null when the SVG isn't mounted (no run
   * has happened yet, or the preview was unmounted).
   */
  captureThumbnail(): Promise<HTMLCanvasElement | null> {
    const svg = document.getElementById(SVG_ID);
    if (!(svg instanceof SVGSVGElement)) return Promise.resolve(null);
    return svgToCanvas(svg);
  }
}

export default NeighborhoodMiniApp;
