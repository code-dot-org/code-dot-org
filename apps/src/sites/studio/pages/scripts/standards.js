import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/code-studio/redux';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-unit-rollup]');
  const unitData = JSON.parse(script.dataset.unitRollup);
  const unitSummary = unitData.unit_summary;

  const store = getStore();

  const root = createRoot(document.getElementById('roll_up'));

  root.render(
    <Provider store={store}>
      <UnitRollup objectToRollUp={'Standards'} unit={unitSummary} />
    </Provider>
  );
}
