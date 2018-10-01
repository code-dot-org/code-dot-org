import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import AppView from '../templates/AppView';
import {getStore} from "../redux";

export default class Dance {
  constructor() {
    /** @type {StudioApp} */
    this.studioApp_ = null;
  }

  injectStudioApp(studioApp) {
    this.studioApp_ = studioApp;
  }

  init(config) {
    this.studioApp_.setPageConstants(config);

    const onMount = () => {
      config.valueTypeTabShapeMap = {
        [Blockly.BlockValueType.SPRITE]: 'angle',
      };
      this.studioApp_.init(config);
    };

    ReactDOM.render(
      <Provider store={getStore()}>
        <AppView
          visualizationColumn={<div id="belowVisualization">Hello world</div>}
          onMount={onMount}
        />
      </Provider>,
      document.getElementById(config.containerId)
    );
  }
}
