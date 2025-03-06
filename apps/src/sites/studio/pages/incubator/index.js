import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {getStore} from '@cdo/apps/code-studio/redux';
import Incubator from '@cdo/apps/templates/studioHomepages/Incubator';
import experiments from '@cdo/apps/util/experiments';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

$(document).ready(function () {
  ReactDOM.render(
    <Provider store={getStore()}>
      <Incubator />
    </Provider>,
    document.getElementById('incubator-container')
  );
  displayDifferentiationChat();
});

function displayDifferentiationChat() {
  const aiDiffFabMountPoint = document.getElementById(
    'ai-differentiation-fab-mount-point'
  );

  if (aiDiffFabMountPoint && experiments.isEnabled('ai-differentiation')) {
    ReactDOM.render(
      <Provider store={getStore()}>
        <AiDiffFloatingActionButton
          context={AiDiffContext.GENERAL}
          scriptId={null}
          scriptName={null}
          unitDisplayName={null}
        />
      </Provider>,
      aiDiffFabMountPoint
    );
  }
}
