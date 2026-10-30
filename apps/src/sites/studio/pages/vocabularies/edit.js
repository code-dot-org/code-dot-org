import React from 'react';
import {Provider} from 'react-redux';

import AllVocabulariesEditor from '@cdo/apps/levelbuilder/AllVocabulariesEditor';
import vocabulariesEditor, {
  initVocabularies,
} from '@cdo/apps/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const vocabularies = getScriptData('vocabularies');
  const courseVersionData = getScriptData('courseVersionData');
  const courseName = getScriptData('courseName');

  registerReducers({
    vocabularies: vocabulariesEditor,
  });
  const store = getStore();
  store.dispatch(initVocabularies(vocabularies || []));

  createReactRoot(
    <Provider store={store}>
      <AllVocabulariesEditor
        vocabularies={vocabularies}
        courseVersionId={courseVersionData.id}
        courseVersionLessons={courseVersionData.lessons}
        courseName={courseName}
      />
    </Provider>,
    document.getElementById('vocabularies-table')
  );
});
