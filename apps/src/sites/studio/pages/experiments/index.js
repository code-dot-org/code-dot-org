import $ from 'jquery';
import React from 'react';

import ExperimentsPage from '@cdo/apps/templates/experiments/ExperimentsPage';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  const script = document.querySelector('script[data-experiments]');
  const serverExperiments = JSON.parse(script.dataset.experiments);

  createReactRoot(
    <ExperimentsPage serverExperiments={serverExperiments} />,
    document.getElementById('experiments-page')
  );
});
