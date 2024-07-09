import 'babel-polyfill';
import $ from 'jquery';
import './assetPath';
import {queryStrFor} from './helpers';
import {initAll} from './init';
import Sounds from './Sounds';
import {getState} from './state';

let currentAppMode = queryStrFor('mode') || 'fishvtrash';
const currentGuides = queryStrFor('guides');
let textToSpeechLocale = queryStrFor('tts');
let canvas, backgroundCanvas;

function onLevelChange(event) {
  // Stop any typing sounds.  (Don't modify state, though, since that would
  // callback into our renderer again.)
  const existingTypingTimer = getState().guideTypingTimer;
  if (existingTypingTimer) {
    clearInterval(existingTypingTimer);
  }

  currentAppMode = event.target.id;
  initDemoPage();
}

function initDemoPage() {
  const sounds = new Sounds();

  initAll({
    appMode: currentAppMode,
    guides: currentGuides,
    textToSpeechLocale,
    onContinue,
    canvas,
    backgroundCanvas,
    playSound: sounds.play.bind(sounds),
    registerSound: sounds.register.bind(sounds)
  });
}

function onContinue() {
  const nextRadioButton = $(`#${currentAppMode}`).next();
  if (nextRadioButton.length > 0) {
    nextRadioButton.prop('checked', true);
    onLevelChange({
      target: {
        id: nextRadioButton.attr('id')
      }
    });
  }
}

$(document).ready(() => {
  // Set up canvases.
  canvas = document.getElementById('activity-canvas');
  backgroundCanvas = document.getElementById('background-canvas');

  $(`#${currentAppMode}`).prop('checked', true);
  $('.level-radio').change(onLevelChange);

  initDemoPage();
});
