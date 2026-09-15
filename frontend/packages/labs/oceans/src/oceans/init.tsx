import {createRoot, type Root} from 'react-dom/client';

import constants, {Modes, OCEANS_UI_CONTAINER_ID} from './constants';
import I18n from './i18n';
import modeHelpers from './modeHelpers';
import soundLibrary from './models/soundLibrary';
import {render as renderCanvas, stopRender} from './renderer';
import {
  getState,
  setInitialState,
  setState,
  setSetStateCallback,
} from './state';
import UI from './ui';

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

// Persist the React root and its container across re-renders.  We only
// call createRoot when the container DOM element changes (component
// unmount→remount); reusing the same root on appMode changes avoids
// React's "container already passed to createRoot" warning.
let uiRoot: Root | null = null;
let uiContainer: HTMLElement | null = null;

//
// Required in options:
//  canvas
//  backgroundCanvas
//  appMode
//  onContinue
//  guides
//
export const initAll = function (options: InitAllOptions): void {
  const {canvas, backgroundCanvas} = options;

  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  // Pass registerSound and playSound from options to soundLibrary.
  soundLibrary.injectSoundAPIs(options);

  soundLibrary.loadSounds();

  I18n.initI18n(options.i18n);

  // Set initial state for UI elements.
  setInitialState({
    currentMode: Modes.Loading,
    ...options,
  });

  // Initialize our first model.
  modeHelpers.toMode(Modes.Loading);

  // Start the canvas renderer.  It will self-perpetute by calling
  // requestAnimationFrame on itself.
  renderCanvas();

  // Render the UI.
  renderUI();

  // And have the render UI handler be called every time state is set.
  setSetStateCallback(renderUI);
};

export const stopUIRerender = (): void => {
  clearInterval(getState().guideTypingTimer);
  setState({guideTypingTimer: undefined}, {skipCallback: true});
  stopRender();
};

function renderUI(): void {
  const container = document.getElementById(OCEANS_UI_CONTAINER_ID);
  if (!container) {
    return;
  }
  if (container !== uiContainer) {
    uiRoot = createRoot(container);
    uiContainer = container;
  }
  uiRoot?.render(<UI />);
}
