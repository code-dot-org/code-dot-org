import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';

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
