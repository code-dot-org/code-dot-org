import 'idempotent-babel-polyfill';
import ReactDOM from 'react-dom';
import React from 'react';
import UI from './ui';
import constants, {Modes} from './constants';
import {setInitialState, setSetStateCallback} from './state';
import {render as renderCanvas} from './renderer';
import {toMode} from './toMode';
import {loadSounds, injectSoundAPIs} from './models/soundLibrary';
import * as I18n from '../utils/i18n';

//
// Required in options:
//  canvas
//  backgroundCanvas
//  appMode
//  onContinue
//
export const initAll = function(options) {
  const {canvas, backgroundCanvas} = options;

  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  // Pass registerSound and playSound from options to soundLibrary.
  injectSoundAPIs(options);

  loadSounds();

  I18n.init();

  // Set initial state for UI elements.
  setInitialState({
    currentMode: Modes.Loading,
    ...options
  });

  // Initialize our first model.
  toMode(Modes.Loading);

  // Start the canvas renderer.  It will self-perpetute by calling
  // requestAnimationFrame on itself.
  renderCanvas();

  // Render the UI.
  renderUI();

  // And have the render UI handler be called every time state is set.
  setSetStateCallback(renderUI);
};

// Tell React to explicitly render the UI.
function renderUI() {
  const renderElement = document.getElementById('container-react');
  ReactDOM.render(<UI />, renderElement);
}
