import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';
import {prepareBlocklyForEmbedding} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  prepareBlockly();
  initPage();
});

function prepareBlockly() {
  const customBlocksConfig = getScriptData('customBlocksConfig');
  if (!customBlocksConfig) {
    return;
  }
  prepareBlocklyForEmbedding(customBlocksConfig);
}

function initPage() {
  const script = document.querySelector('script[data-unit-rollup]');
  const unitData = JSON.parse(script.dataset.unitRollup);
  const unitSummary = unitData.unit_summary;

  const store = getStore();

  ReactDOM.render(
    <Provider store={store}>
      <UnitRollup objectToRollUp={'Code'} unit={unitSummary} />
    </Provider>,
    document.getElementById('roll_up')
  );
}
