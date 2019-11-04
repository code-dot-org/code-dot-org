import 'babel-polyfill';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import React from 'react';
import UI from './ui';
import constants, {Modes} from './constants';
import {setState, setSetStateCallback} from './state';
import {render as renderCanvas} from './renderer';
import {queryStrFor} from './helpers';
import {toMode} from './toMode';

$(document).ready(() => {
  // Set up canvases.
  const canvas = document.getElementById('activity-canvas');
  const backgroundCanvas = document.getElementById('background-canvas');
  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  // Use URL parameter to set mode.
  const appMode = queryStrFor('mode');

  // Set initial state for UI elements.
  setState({
    appMode,
    canvas,
    backgroundCanvas
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
});

// Tell React to explicitly render the UI.
export const renderUI = () => {
  const renderElement = document.getElementById('container-react');
  ReactDOM.render(<UI />, renderElement);
};
