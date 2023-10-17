import AIToolsPanel from '@cdo/apps/code-studio/components/aiTools/aiToolsPanel';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';


$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-aitoolspanel]');
  const aiToolsPanelData = JSON.parse(script.dataset.aitoolspanel);

  renderAIToolsPanel()
}

function renderAIToolsPanel() {
    const div = document.createElement('div');
    div.setAttribute('id', 'ai-tools-panel-container');

  ReactDOM.render(
        <AIToolsPanel />,
    div
  );
  document.body.appendChild(div);
}
