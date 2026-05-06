import {createRoot, type Root} from 'react-dom/client';

import constants, {Modes, OCEANS_UI_CONTAINER_ID} from './constants';
import I18n from './i18n';
import modeHelpers from './modeHelpers';
import soundLibrary from './models/soundLibrary';
import {render as renderCanvas, stopRender} from './renderer';
import {setInitialState, setSetStateCallback} from './state';
import UI from './ui';

/** Options accepted by `initAll`. */
export interface InitAllOptions {
  canvas: HTMLCanvasElement;
  backgroundCanvas: HTMLCanvasElement;
  appMode: string;
  onContinue?: () => void;
  guides?: string;
  textToSpeechLocale?: string;
  playSound: (id: string, options?: {volume?: number}) => void;
  registerSound: (descriptor: {id: string; mp3: string}) => void;
  i18n?: Record<string, (opts?: Record<string, unknown>) => string>;
}

// Persisted root so we call `root.render()` on subsequent state updates
// rather than creating a new root each time.
let uiRoot: Root | null = null;

/**
 * Initialises the AI for Oceans lab within the provided canvas elements.
 *
 * Sets canvas dimensions, wires sounds, initialises i18n, seeds state,
 * starts the canvas render loop, and mounts the React UI.
 *
 * @param options - Configuration for the lab session.
 */
export const initAll = function (options: InitAllOptions): void {
  const {canvas, backgroundCanvas} = options;

  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  soundLibrary.injectSoundAPIs(options);
  soundLibrary.loadSounds();

  I18n.initI18n(options.i18n);

  setInitialState({
    currentMode: Modes.Loading,
    ...options,
  });

  modeHelpers.toMode(Modes.Loading);

  // Self-perpetuating canvas render loop via requestAnimationFrame.
  renderCanvas();

  renderUI();

  // Re-render the React UI tree on every state change.
  setSetStateCallback(renderUI);
};

/**
 * Tears down the canvas render loop and unmounts the React UI.
 * Safe to call multiple times; no-ops when already torn down.
 */
export const teardownAll = (): void => {
  stopRender();
  if (uiRoot) {
    uiRoot.unmount();
    uiRoot = null;
  }
};

/** Renders or re-renders the `<UI>` component into the oceans UI container div. */
function renderUI(): void {
  const container = document.getElementById(OCEANS_UI_CONTAINER_ID);
  if (!container) {
    return;
  }
  if (!uiRoot) {
    uiRoot = createRoot(container);
  }
  uiRoot.render(<UI />);
}
