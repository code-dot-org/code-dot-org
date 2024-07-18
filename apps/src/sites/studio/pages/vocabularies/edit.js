import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import AllVocabulariesEditor from '@cdo/apps/lib/levelbuilder/AllVocabulariesEditor';
import vocabulariesEditor, {
  initVocabularies,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
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

  const root = createRoot(document.getElementById('vocabularies-table'));

  root.render(
    <Provider store={store}>
      <AllVocabulariesEditor
        vocabularies={vocabularies}
        courseVersionId={courseVersionData.id}
        courseVersionLessons={courseVersionData.lessons}
        courseName={courseName}
      />
    </Provider>
  );
});
