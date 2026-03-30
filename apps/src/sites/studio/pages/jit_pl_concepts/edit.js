import React from 'react';
import {Provider} from 'react-redux';

import JitPlConceptFormEditor from '@cdo/apps/levelbuilder/jit-pl-concepts-editor/JitPlConceptFormEditor';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/levelbuilder/lesson-editor/resourcesEditorRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  registerReducers({
    resources: createResourcesReducer('jitPlConceptResource'),
  });
  const store = getStore();
  const {
    id,
    name,
    display_name,
    text_content,
    resources,
    exemplars,
    misconceptions,
  } = getScriptData('jitPlConcept');

  store.dispatch(initResources('jitPlConceptResource', resources || []));

  createReactRoot(
    <Provider store={store}>
      <JitPlConceptFormEditor
        conceptId={id}
        originalName={name}
        originalDisplayName={display_name}
        originalTextContent={text_content}
        originalExemplars={exemplars || []}
        originalMisconceptions={misconceptions || []}
      />
    </Provider>,
    document.getElementById('edit-jit-pl-concept')
  );
});
