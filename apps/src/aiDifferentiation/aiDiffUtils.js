import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {getStore} from '@cdo/apps/redux';
import experiments from '@cdo/apps/util/experiments';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

export function displayDifferentiationChat() {
  const aiDiffFabMountPoint = document.getElementById(
    'ai-differentiation-fab-mount-point'
  );

  const context = {type: AiDiffContext.GENERAL};

  if (aiDiffFabMountPoint && experiments.isEnabled('ai-differentiation')) {
    ReactDOM.render(
      <Provider store={getStore()}>
        <AiDiffFloatingActionButton context={context} />
      </Provider>,
      aiDiffFabMountPoint
    );
  }
}
