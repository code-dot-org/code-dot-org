import AIToolsPanel from '@cdo/apps/code-studio/components/aiTools/aiToolsPanel';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';

$(document).ready(initPage);

function initPage() {
  renderAIToolsPanel();
}

function renderAIToolsPanel() {
  const div = document.createElement('div');
  div.setAttribute('id', 'ai-tools-panel-container');
  const store = getStore();

  ReactDOM.render(
    <Provider store={store}>
      <AIToolsPanel />
    </Provider>,
    div
  );
  document.body.appendChild(div);
}
