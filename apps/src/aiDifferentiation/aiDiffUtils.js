import React from 'react';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import experiments from '@cdo/apps/util/experiments';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

export function displayDifferentiationChat() {
  const aiDiffFabMountPoint = document.getElementById(
    'ai-differentiation-fab-mount-point'
  );

  const context = {type: AiDiffContext.GENERAL};

  if (aiDiffFabMountPoint && experiments.isEnabled('ai-differentiation')) {
    createReactRoot(
      <Provider store={getStore()}>
        <AiDiffFloatingActionButton context={context} />
      </Provider>,
      aiDiffFabMountPoint
    );
  }
}
