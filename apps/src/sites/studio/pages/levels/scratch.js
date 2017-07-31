import AudioEngine from 'scratch-audio';
import Renderer from 'scratch-render';
import Storage from 'scratch-storage';
import VM from 'scratch-vm';
import Blockly from 'scratch-blocks/dist/vertical.js';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import loadAppOptions from "@cdo/apps/code-studio/initApp/loadApp";
import { getStore, registerReducers } from '@cdo/apps/redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import { singleton as studioApp } from '@cdo/apps/StudioApp';
import ScratchView from './ScratchView';
import { scratchDefaultProject } from './scratchDefaultProject';

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

loadAppOptions().then(appOptions => {
  const options = {
    maxVisualizationWidth: 480,
    vizAspectRatio: 4 / 3,
    hideSource: false,
    enableShowCode: false,
    readonlyWorkspace: false,
    pinWorkspaceToBottom: true,
    ...appOptions,
  };
  window.appOptions = options;

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

  if (options.level.lastAttempt) {
    vm.loadProject(options.level.lastAttempt);
  } else {
    vm.loadProject(scratchDefaultProject);
  }

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
  document.getElementById('greenflag').addEventListener('click', vm.greenFlag.bind(vm));
  document.getElementById('stopall').addEventListener('click', vm.stopAll.bind(vm));
});
