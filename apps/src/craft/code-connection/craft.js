import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {singleton as studioApp} from '@cdo/apps/StudioApp';
import codegen from '@cdo/apps/codegen';
import {getStore} from '@cdo/apps/redux';
import AppView from '@cdo/apps/templates/AppView';
import CraftVisualizationColumn from './CraftVisualizationColumn';

const MEDIA_URL = '/blockly/media/craft/';

const COMMON_UI_ASSETS = [
  MEDIA_URL + "Sliced_Parts/MC_Loading_Spinner.gif",
  MEDIA_URL + "Sliced_Parts/Frame_Large_Plus_Logo.png",
  MEDIA_URL + "Sliced_Parts/Pop_Up_Slice.png",
  MEDIA_URL + "Sliced_Parts/X_Button.png",
  MEDIA_URL + "Sliced_Parts/Button_Grey_Slice.png",
  MEDIA_URL + "Sliced_Parts/MC_Button_Pressed.png",
  MEDIA_URL + "Sliced_Parts/Run_Button_Up_Slice.png",
  MEDIA_URL + "Sliced_Parts/Run_Button_Down_Slice.png",
  MEDIA_URL + "Sliced_Parts/MC_Run_Arrow_Icon_Smaller.png",
  MEDIA_URL + "Sliced_Parts/MC_Up_Arrow_Icon.png",
  MEDIA_URL + "Sliced_Parts/MC_Down_Arrow_Icon.png",
  MEDIA_URL + "Sliced_Parts/Reset_Button_Up_Slice.png",
  MEDIA_URL + "Sliced_Parts/MC_Reset_Arrow_Icon.png",
  MEDIA_URL + "Sliced_Parts/Reset_Button_Down_Slice.png",
  MEDIA_URL + "Sliced_Parts/Callout_Tail.png",
];

const preloadImage = function (url) {
  const img = new Image();
  img.src = url;
};

const executeUserCode = function () {
  let codeBlocks = Blockly.mainBlockSpace.getTopBlocks(true);
  const code = Blockly.Generator.blocksToCode('JavaScript', codeBlocks);
  let interpreter;

  const evalApiMethods = {
    log: function (blockID, value) {
      studioApp().highlight(blockID);
      console.log('Logged: ' + value);
    },
    prompt: function (blockID, callback) {
      studioApp().highlight(blockID);
      const value = prompt('Enter a value:');
      setTimeout(() => {
        callback(value);
        interpreter.run();
      }, 0);
    },
    delay: function (blockID, milliseconds, callback) {
      studioApp().highlight(blockID);
      setTimeout(() => {
        callback();
        interpreter.run();
      }, milliseconds);
    }
  };

  codegen.asyncFunctionList = [evalApiMethods.prompt, evalApiMethods.delay];
  interpreter = codegen.evalWith(code, evalApiMethods);
};

export default class Craft {
  /**
   * Initialize Blockly and the Craft app. Called on page load.
   */
  static init(config) {
    config.level.disableFinalStageMessage = true;
    config.showInstructionsInTopPane = true;

    document.body.className += " minecraft";

    Craft.initialConfig = config;

    // Replace studioApp methods with our own.
    studioApp().reset = Craft.reset;
    studioApp().runButtonClick = Craft.runButtonClick;

    // Push initial level properties into the Redux store
    studioApp().setPageConstants(config, {
      isMinecraft: true
    });

    Craft.render(config);
  }

  static render(config) {
    const onMount = function () {
      studioApp().init({
        enableShowCode: false,
        ...config,
      });

      COMMON_UI_ASSETS.forEach(function (url) {
        preloadImage(url);
      });
    };

    ReactDOM.render(
      <Provider store={getStore()}>
        <AppView
          visualizationColumn={
            <CraftVisualizationColumn showScore={!!config.level.useScore}/>
          }
          onMount={onMount}
        />
      </Provider>,
      document.getElementById(config.containerId)
    );
  }

  /**
   * Reset the app to the start position and kill any pending animation tasks.
   * @param {boolean} first true if first reset (during app load)
   */
  static reset(first) {
    if (first) {
      return;
    }
    console.log('reset');
  }

  /**
   * Click the run button.  Start the program.
   */
  static runButtonClick() {
    console.log('run');

    const runButton = document.getElementById('runButton');
    const resetButton = document.getElementById('resetButton');

    // Ensure that Reset button is at least as wide as Run button.
    if (!resetButton.style.minWidth) {
      resetButton.style.minWidth = runButton.offsetWidth + 'px';
    }

    studioApp().toggleRunReset('reset');
    studioApp().attempts++;

    executeUserCode();
  }
}
