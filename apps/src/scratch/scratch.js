import AudioEngine from 'scratch-audio';
import Renderer from 'scratch-render';
import Storage from 'scratch-storage';
import VM from 'scratch-vm';
import Blockly from 'scratch-blocks';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { getStore, registerReducers } from '@cdo/apps/redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import { singleton as studioApp } from '@cdo/apps/StudioApp';
import ScratchView from './ScratchView';
import { scratchDefaultProject } from './scratchDefaultProject';

export const __TestInterface = {};

export default function init(options) {
  registerReducers(commonReducers);

  options.maxVisualizationWidth = 480;
  options.vizAspectRatio = 4 / 3;
  options.enableShowCode = false;
  options.pinWorkspaceToBottom = true;
  options.skin = {};
  window.appOptions = options;

  studioApp().configure(options);
  studioApp().setPageConstants(options, {});

  ReactDOM.render(
    <Provider store={getStore()}>
      <ScratchView onMount={() => studioApp().init(options)} />
    </Provider>,
    document.getElementById(options.containerId),
  );

  /**
   * @param {Asset} asset - calculate a URL for this asset.
   * @returns {string} a URL to download a project asset (PNG, WAV, etc.)
   */
  function getAssetUrl(asset) {
    return studioApp().assetUrl(`media/scratch/${asset.assetId}.${asset.dataFormat}`);
  }

  // Instantiate the VM.
  const vm = new VM();
  __TestInterface.vm = vm;
  options.getCode = vm.saveProjectSb3.bind(vm);

  const storage = new Storage();
  const AssetType = storage.AssetType;
  storage.addWebSource([AssetType.ImageVector, AssetType.ImageBitmap, AssetType.Sound], getAssetUrl);
  vm.attachStorage(storage);

  // Instantiate the renderer and connect it to the VM.
  const canvas = document.getElementById('scratch-stage');

  // PhantomJS doesn't support WebGL.
  if (!IN_UNIT_TEST) {
    const renderer = new Renderer(canvas);
    vm.attachRenderer(renderer);
    const audioEngine = new AudioEngine();
    vm.attachAudioEngine(audioEngine);
  }

  // Load the project.
  let project = scratchDefaultProject;
  if (options.level.lastAttempt) {
    project = options.level.lastAttempt;
  }
  vm.loadProject(project).then(() => options.onInitialize());

  // Instantiate scratch-blocks and attach it to the DOM.
  const workspace = Blockly.inject('codeWorkspace', {
    media: studioApp().assetUrl('media/scratch-blocks/'),
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

  registerBlockEvents(vm, workspace);
  registerInputEvents(vm, canvas);

  // Run threads.
  vm.start();
}

/**
 * Register scratch-blocks events with the VM.
 * @param vm
 * @param workspace
 */
function registerBlockEvents(vm, workspace) {
  workspace.addChangeListener(vm.blockListener);
  workspace.addChangeListener(vm.variableListener);
  workspace.addChangeListener(() => dispatchEvent(new Event('workspaceChange')));
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
  vm.on('SCRIPT_GLOW_ON', data => workspace.glowStack(data.id, true));
  vm.on('SCRIPT_GLOW_OFF', data => workspace.glowStack(data.id, false));
  vm.on('BLOCK_GLOW_ON', data => workspace.glowBlock(data.id, true));
  vm.on('BLOCK_GLOW_OFF', data => workspace.glowBlock(data.id, false));
  vm.on('VISUAL_REPORT', data => workspace.reportValue(data.id, data.value));
}

function getCanvasCoordinates(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    canvasWidth: rect.width,
    canvasHeight: rect.height,
  };
}

/**
 * Register mouse and keyboard events with the VM.
 * @param vm
 * @param canvas
 */
function registerInputEvents(vm, canvas) {
  const greenFlag = document.getElementById('green-flag');
  const stopAll = document.getElementById('stop-all');

  document.addEventListener('mousemove', e => {
    vm.postIOData('mouse', getCanvasCoordinates(canvas, e));
  });

  canvas.addEventListener('mousedown', e => {
    const data = {
      isDown: true,
      ...getCanvasCoordinates(canvas, e),
    };
    vm.postIOData('mouse', data);
    e.preventDefault();
  });

  canvas.addEventListener('mouseup', e => {
    const data = {
      isDown: false,
      ...getCanvasCoordinates(canvas, e),
    };
    vm.postIOData('mouse', data);
    e.preventDefault();
  });

  document.addEventListener('keydown', e => {
    // Don't capture keys intended for Blockly inputs.
    if ([document, document.body, greenFlag, stopAll].includes(e.target)) {
      vm.postIOData('keyboard', {
        keyCode: e.keyCode,
        isDown: true,
      });
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', e => {
    // Always capture up events, even those that have switched to other targets.
    vm.postIOData('keyboard', {
      keyCode: e.keyCode,
      isDown: false,
    });
  });

  greenFlag.addEventListener('click', vm.greenFlag.bind(vm));
  stopAll.addEventListener('click', vm.stopAll.bind(vm));
}
