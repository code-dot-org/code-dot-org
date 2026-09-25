import React from 'react';
import {Provider} from 'react-redux';

import AiTutorialDemoView from '@cdo/apps/aiTutorialDemo/AiTutorialDemoView';
// Imported for its side effect of registering the code-studio reducers
// (lab, currentUser, ...). ChatMessage's copy-analytics thunk reads
// state.lab and throws if the slice was never registered.
import {getStore} from '@cdo/apps/code-studio/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

createReactRoot(
  <Provider store={getStore()}>
    <AiTutorialDemoView />
  </Provider>,
  document.getElementById('ai-tutorial-demo')
);
