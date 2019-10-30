import $ from 'jquery';
import constants, {Modes} from './constants';
import {setState, setSetStateCallback} from './state';
import {init as initModel} from './models';
import {render as renderCanvas} from './renderer';
import {queryStrFor} from './helpers';

import 'babel-polyfill';
import ReactDOM from 'react-dom';
import React from 'react';
import UI from './ui';

$(document).ready(() => {
  // Set up canvases.
  const canvas = document.getElementById('activity-canvas');
  const backgroundCanvas = document.getElementById('background-canvas');
  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  // Temporarily use URL parameter to set some state.
  const dataSet = queryStrFor('set') && queryStrFor('set').toLowerCase();

  // Set initial state for UI elements.
  const state = setState({
    currentMode: Modes.Loading,
    canvas,
    backgroundCanvas,
    dataSet
  });

  // Initialize our first model.
  initModel(state);

  // Start the canvas renderer.  It will self-perpetute by calling
  // requestAnimationFrame on itself.
  renderCanvas();

  // Render the UI.
  renderUI();

  // And have the render UI handler be called every time state is set.
  setSetStateCallback(renderUI);
});

// Tell React to explicitly render the UI.
export const renderUI = () => {
  const renderElement = document.getElementById('container-react');
  ReactDOM.render(<UI />, renderElement);
};
