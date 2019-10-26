import $ from 'jquery';
import constants, {Modes} from './constants';
import {setState} from './state';
import {init as initScene} from './init';
import {render} from './renderer';

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

  // Set initial state for UI elements.
  setState({
    currentMode: Modes.Loading,
    canvas,
    backgroundCanvas,
    uiContainer: document.getElementById('ui-container'),
    headerContainer: document.getElementById('header-container'),
    footerContainer: document.getElementById('footer-container')
  });

  // Initialize our first model.
  initScene();

  // Start the canvas renderer.  It will self-perpetute by calling
  // requestAnimationFrame on itself.
  render();

  // Start the React renderer.
  const renderElement = document.getElementById('container-react');
  setInterval(() => {
    ReactDOM.render(<UI />, renderElement);
  }, 1000);
});
