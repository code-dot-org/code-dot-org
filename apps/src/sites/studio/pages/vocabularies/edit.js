import getScriptData from '@cdo/apps/util/getScriptData';
import React from 'react';
import ReactDOM from 'react-dom';
import AllVocabulariesEditor from '@cdo/apps/lib/levelbuilder/AllVocabulariesEditor';
import vocabulariesEditor, {
  initVocabularies
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';

$(document).ready(function() {
  const vocabularies = getScriptData('vocabularies');
  const courseVersionData = getScriptData('courseVersionData');
  const courseName = getScriptData('courseName');

  registerReducers({
    vocabularies: vocabulariesEditor
  });
  const store = getStore();
  store.dispatch(initVocabularies(vocabularies || []));

  ReactDOM.render(
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
