import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';
import {prepareBlocklyForEmbeddingAllEnvironments} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  prepareBlocklyForEmbeddingAllEnvironments();
  initPage();
});

function initPage() {
  const script = document.querySelector('script[data-unit-rollup]');
  const unitData = JSON.parse(script.dataset.unitRollup);
  const unitSummary = unitData.unit_summary;

  const store = getStore();

  createReactRoot(
    <Provider store={store}>
      <UnitRollup objectToRollUp={'Code'} unit={unitSummary} />
    </Provider>,
    document.getElementById('roll_up')
  );
}
