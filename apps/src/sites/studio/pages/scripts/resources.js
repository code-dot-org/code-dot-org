import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-unit-rollup]');
  const unitData = JSON.parse(script.dataset.unitRollup);
  const unitSummary = unitData.unit_summary;

  const store = getStore();

  ReactDOM.render(
    <Provider store={store}>
      <UnitRollup objectToRollUp={'Resources'} unit={unitSummary} />
    </Provider>,
    document.getElementById('roll_up')
  );
}
