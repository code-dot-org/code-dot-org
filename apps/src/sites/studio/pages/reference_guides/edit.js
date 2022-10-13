import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ReferenceGuideEditor from '@cdo/apps/lib/levelbuilder/reference-guide-editor/ReferenceGuideEditor';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import reducers, {
  initLevelSearching
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';

$(() => {
  // instructionsDialog reducer is needed for the ExpandableImageDialog
  registerReducers({
    ...reducers,
    instructionsDialog
  });
  const store = getStore();

  const referenceGuide = getScriptData('referenceGuide');
  const referenceGuides = getScriptData('referenceGuides');
  const updateUrl = getScriptData('updateUrl');
  const editAllUrl = getScriptData('editAllUrl');
  const levelSearchingInfo = getScriptData('levelSearchingInfo');
  store.dispatch(initLevelSearching(levelSearchingInfo));

  ReactDOM.render(
    <Provider store={store}>
      <ReferenceGuideEditor
        referenceGuide={referenceGuide}
        referenceGuides={referenceGuides}
        updateUrl={updateUrl}
        editAllUrl={editAllUrl}
      />
    </Provider>,
    document.getElementById('show-container')
  );
});
