import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {getStore, registerReducers} from '@cdo/apps/redux';
import teachingProfile, {
  fetchTeachingProfileData,
} from '@cdo/apps/templates/teachingProfileRedux';
import experiments from '@cdo/apps/util/experiments';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

export function displayDifferentiationChat() {
  const aiDiffFabMountPoint = document.getElementById(
    'ai-differentiation-fab-mount-point'
  );

  const context = {type: AiDiffContext.GENERAL};

  if (aiDiffFabMountPoint && experiments.isEnabled('ai-differentiation')) {
    registerReducers({teachingProfile});
    const store = getStore();
    store.dispatch(fetchTeachingProfileData());
    ReactDOM.render(
      <Provider store={store}>
        <AiDiffFloatingActionButton context={context} />
      </Provider>,
      aiDiffFabMountPoint
    );
  }
}
