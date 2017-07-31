import AudioEngine from 'scratch-audio';
import Renderer from 'scratch-render';
import Storage from 'scratch-storage';
import VM from 'scratch-vm';
import Blockly from 'scratch-blocks/dist/vertical.js';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { getStore, registerReducers } from '@cdo/apps/redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import { singleton as studioApp } from '@cdo/apps/StudioApp';
import ScratchView from './ScratchView';

const Scratch = window.Scratch = window.Scratch || {};

/**
 * @param {Asset} asset - calculate a URL for this asset.
 * @returns {string} a URL to download a project asset (PNG, WAV, etc.)
 */
const getAssetUrl = function (asset) {
  const assetUrlParts = [
    '/blockly/media/scratch/',
    asset.assetId,
    '.',
    asset.dataFormat,
  ];
  return assetUrlParts.join('');
};

registerReducers(commonReducers);

const script = document.querySelector('script[data-options]');
const appOptions = JSON.parse(script.dataset.options);

const options = {
  containerId: 'codeApp',
  hideSource: false,
  readonlyWorkspace: false,
  pinWorkspaceToBottom: true,
  ...appOptions,
  level: {
    scratch: true,
    editCode: false,
    ...appOptions.level,
  },
};

studioApp().configure(options);
studioApp().setPageConstants(options, {});

ReactDOM.render(
  <Provider store={getStore()}>
    <ScratchView onMount={onMount} />
  </Provider>,
  document.getElementById(options.containerId),
);

function onMount() {
  studioApp().init(options);
}

// Lots of global variables to make debugging easier
// Instantiate the VM.
const vm = new VM();
Scratch.vm = vm;

const storage = new Storage();
const AssetType = storage.AssetType;
storage.addWebSource([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], getAssetUrl);
vm.attachStorage(storage);

// Instantiate the renderer and connect it to the VM.
const canvas = document.getElementById('scratch-stage');
const renderer = new Renderer(canvas);
Scratch.renderer = renderer;
vm.attachRenderer(renderer);
const audioEngine = new AudioEngine();
vm.attachAudioEngine(audioEngine);

vm.loadProject(`{
      "objName": "Stage",
      "sounds": [],
      "costumes": [{
          "costumeName": "backdrop1",
          "baseLayerID": 2,
          "baseLayerMD5": "739b5e2a2435f6e1ec2993791b423146.png",
          "bitmapResolution": 1,
          "rotationCenterX": 240,
          "rotationCenterY": 180
      }],
      "currentCostumeIndex": 0,
      "penLayerMD5": "5c81a336fab8be57adc039a8a2b33ca9.png",
      "penLayerID": -1,
      "tempoBPM": 60,
      "videoAlpha": 0.5,
      "children": [{
          "objName": "Sprite1",
          "sounds": [],
          "costumes": [{
              "costumeName": "costume1",
              "baseLayerID": 0,
              "baseLayerMD5": "09dc888b0b7df19f70d81588ae73420e.svg",
              "bitmapResolution": 1,
              "rotationCenterX": 47,
              "rotationCenterY": 55
          }, {
              "costumeName": "costume2",
              "baseLayerID": 1,
              "baseLayerMD5": "3696356a03a8d938318876a593572843.svg",
              "bitmapResolution": 1,
              "rotationCenterX": 47,
              "rotationCenterY": 55
          }],
          "currentCostumeIndex": 0,
          "scratchX": 0,
          "scratchY": 0,
          "scale": 1,
          "direction": 120,
          "rotationStyle": "normal",
          "isDraggable": false,
          "indexInLibrary": 1,
          "visible": true,
          "spriteInfo": {
          }
      }],
      "info": {
          "swfVersion": "v449",
          "scriptCount": 0,
          "videoOn": false,
          "flashVersion": "WIN 22,0,0,209",
          "hasCloudData": false,
          "userAgent": "Mozilla\/5.0 (Windows NT 5.1) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/49.0.2623.112 Safari\/537.36",
          "spriteCount": 1
      }
  }`);

// Instantiate scratch-blocks and attach it to the DOM.
const workspace = Blockly.inject('codeWorkspace', {
  media: '/blockly/media/scratch-blocks/',
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.75,
  },
  colours: {
    workspace: '#fff',
    flyout: '#ddd',
    insertionMarkerOpacity: 0.1,
  }
});
Scratch.workspace = workspace;

// Attach scratch-blocks events to VM.
workspace.addChangeListener(vm.blockListener);
workspace.addChangeListener(vm.variableListener);
const flyoutWorkspace = workspace.getFlyout().getWorkspace();
flyoutWorkspace.addChangeListener(vm.flyoutBlockListener);
flyoutWorkspace.addChangeListener(vm.monitorBlockListener);

// Receipt of new block XML for the selected target.
vm.on('workspaceUpdate', data => {
  workspace.clear();
  const dom = Blockly.Xml.textToDom(data.xml);
  Blockly.Xml.domToWorkspace(dom, workspace);
});

// Feedback for stacks and blocks running.
vm.on('SCRIPT_GLOW_ON', data => {
  workspace.glowStack(data.id, true);
});
vm.on('SCRIPT_GLOW_OFF', data => {
  workspace.glowStack(data.id, false);
});
vm.on('BLOCK_GLOW_ON', data => {
  workspace.glowBlock(data.id, true);
});
vm.on('BLOCK_GLOW_OFF', data => {
  workspace.glowBlock(data.id, false);
});
vm.on('VISUAL_REPORT', data => {
  workspace.reportValue(data.id, data.value);
});

// Feed mouse events as VM I/O events.
document.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const coordinates = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    canvasWidth: rect.width,
    canvasHeight: rect.height
  };
  Scratch.vm.postIOData('mouse', coordinates);
});
canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  const data = {
    isDown: true,
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    canvasWidth: rect.width,
    canvasHeight: rect.height
  };
  Scratch.vm.postIOData('mouse', data);
  e.preventDefault();
});
canvas.addEventListener('mouseup', e => {
  const rect = canvas.getBoundingClientRect();
  const data = {
    isDown: false,
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    canvasWidth: rect.width,
    canvasHeight: rect.height
  };
  Scratch.vm.postIOData('mouse', data);
  e.preventDefault();
});

// Feed keyboard events as VM I/O events.
document.addEventListener('keydown', e => {
  // Don't capture keys intended for Blockly inputs.
  if (e.target !== document && e.target !== document.body) {
    return;
  }
  Scratch.vm.postIOData('keyboard', {
    keyCode: e.keyCode,
    isDown: true
  });
  e.preventDefault();
});
document.addEventListener('keyup', e => {
  // Always capture up events,
  // even those that have switched to other targets.
  Scratch.vm.postIOData('keyboard', {
    keyCode: e.keyCode,
    isDown: false
  });
  // E.g., prevent scroll.
  if (e.target !== document && e.target !== document.body) {
    e.preventDefault();
  }
});

// Run threads
vm.start();

// Handlers for green flag and stop all.
document.getElementById('greenflag').addEventListener('click', () => {
  vm.greenFlag();
});
document.getElementById('stopall').addEventListener('click', () => {
  vm.stopAll();
});
