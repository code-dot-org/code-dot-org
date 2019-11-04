import 'babel-polyfill';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import React from 'react';
import UI from './ui';
import constants, {Modes} from './constants';
import {setInitialState, setSetStateCallback} from './state';
import {render as renderCanvas} from './renderer';
import {queryStrFor} from './helpers';
import {toMode} from './toMode';

let currentAppMode = queryStrFor('mode') || 'intro-instructions';

function onLevelChange(event) {
  currentAppMode = event.target.id;
  initAll(currentAppMode);
}

function onContinue() {
  const nextRadioButton = $(`#${currentAppMode}`).next();
  if (nextRadioButton) {
    nextRadioButton.prop('checked', true);
    onLevelChange({
      target: {
        id: nextRadioButton.attr('id')
      }
    });
  }
}

$(document).ready(() => {
  $(`#${currentAppMode}`).prop('checked', true);
  $('.level-radio').change(onLevelChange);

  initAll(currentAppMode);
});

export const initAll = function(appMode) {
  // Set up canvases.
  const canvas = document.getElementById('activity-canvas');
  const backgroundCanvas = document.getElementById('background-canvas');
  canvas.width = backgroundCanvas.width = constants.canvasWidth;
  canvas.height = backgroundCanvas.height = constants.canvasHeight;

  // Set initial state for UI elements.
  setInitialState({
    appMode,
    canvas,
    backgroundCanvas,
    currentMode: Modes.Loading,
    onContinue
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
export const renderUI = () => {
  const renderElement = document.getElementById('container-react');
  ReactDOM.render(<UI />, renderElement);
};
