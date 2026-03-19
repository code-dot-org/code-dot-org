import React from 'react';
import {Provider} from 'react-redux';

import JitPlConceptFormEditor from '@cdo/apps/levelbuilder/jit-pl-concepts-editor/JitPlConceptFormEditor';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const store = getStore();
  const {id, name, display_name, text_content} = getScriptData('jitPlConcept');

  createReactRoot(
    <Provider store={store}>
      <JitPlConceptFormEditor
        conceptId={id}
        originalName={name}
        originalDisplayName={display_name}
        originalTextContent={text_content}
      />
    </Provider>,
    document.getElementById('edit-jit-pl-concept')
  );
});
