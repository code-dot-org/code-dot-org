/** @file JavaScript run only on the /s/:script_name/edit page. */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import reducers, {init} from '@cdo/apps/lib/script-editor/editorRedux';
import ScriptEditor from '@cdo/apps/lib/script-editor/ScriptEditor';

export default function initPage(scriptEditorData) {
  const scriptData = scriptEditorData.script;
  const stages = scriptData.stages.filter(stage => stage.id).map(stage => ({
    position: stage.position,
    flex_category: stage.flex_category,
    lockable: stage.lockable,
    name: stage.name,
    // Only include the first level of an assessment (uid ending with "_0").
    levels: stage.levels.filter(level => !level.uid || /_0$/.test(level.uid)).map(level => ({
      position: level.position,
      activeId: level.activeId,
      ids: level.ids.slice(),
      kind: level.kind,
      skin: level.skin,
      videoKey: level.videoKey,
      concepts: level.concepts,
      conceptDifficulty: level.conceptDifficulty,
      progression: level.progression
    }))
  }));

  registerReducers(reducers);
  const store = getStore();
  store.dispatch(init(stages, scriptEditorData.levelKeyList));

  ReactDOM.render(
    <Provider store={store}>
      <ScriptEditor
        beta={scriptEditorData.beta}
        name={scriptEditorData.script.name}
        i18nData={scriptEditorData.i18n}
        hidden={scriptData.hidden}
        loginRequired={scriptData.loginRequired}
        hideableStages={scriptData.hideable_stages}
        studentDetailProgressView={scriptData.student_detail_progress_view}
        professionalLearningCourse={scriptData.professionalLearningCourse}
        peerReviewsRequired={scriptData.peerReviewsRequired}
        wrapupVideo={scriptData.wrapupVideo}
      />
    </Provider>,
    document.querySelector('.edit_container')
  );
}

if (!IN_UNIT_TEST) {
  initPage(getScriptData('levelBuilderEditScript'));
}
