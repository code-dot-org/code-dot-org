/** @file JavaScript run only on the /s/:script_name/edit page. */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import getScriptData from '@cdo/apps/util/getScriptData';
import reducers, {init} from '@cdo/apps/lib/script-editor/editorRedux';
import ScriptEditor from '@cdo/apps/lib/script-editor/ScriptEditor';
import {valueOr} from '@cdo/apps/utils';

export default function initPage(scriptEditorData) {
  const scriptData = scriptEditorData.script;
  const stageLevelData = scriptEditorData.stageLevelData;
  const stages = (scriptData.stages || [])
    .filter(stage => stage.id)
    .map(stage => ({
      position: stage.position,
      relativePosition: stage.relative_position,
      flex_category: stage.flex_category,
      lockable: stage.lockable,
      name: stage.name,
      // Only include the first level of an assessment (uid ending with "_0").
      levels: stage.levels
        .filter(level => !level.uid || /_0$/.test(level.uid))
        .map(level => ({
          position: level.position,
          activeId: level.activeId,
          ids: level.ids.slice(),
          kind: level.kind,
          skin: level.skin,
          videoKey: level.videoKey,
          concepts: level.concepts,
          conceptDifficulty: level.conceptDifficulty,
          progression: level.progression,
          named: !!level.name,
          assessment: level.assessment,
          challenge: level.challenge
        }))
    }));
  const locales = scriptEditorData.locales;

  registerReducers({...reducers, isRtl});
  const store = getStore();
  store.dispatch(init(stages, scriptEditorData.levelKeyList));

  const teacherResources = (scriptData.teacher_resources || []).map(
    ([type, link]) => ({type, link})
  );

  let announcements = scriptData.script_announcements || [];

  ReactDOM.render(
    <Provider store={store}>
      <ScriptEditor
        beta={scriptEditorData.beta}
        name={scriptEditorData.script.name}
        i18nData={scriptEditorData.i18n}
        hidden={valueOr(scriptData.hidden, true)}
        loginRequired={scriptData.loginRequired}
        hideableStages={scriptData.hideable_stages}
        studentDetailProgressView={scriptData.student_detail_progress_view}
        professionalLearningCourse={scriptData.professionalLearningCourse}
        peerReviewsRequired={scriptData.peerReviewsRequired}
        wrapupVideo={scriptData.wrapupVideo}
        excludeCsfColumnInLegend={scriptData.excludeCsfColumnInLegend}
        projectWidgetVisible={scriptData.project_widget_visible}
        projectWidgetTypes={scriptData.project_widget_types}
        teacherResources={teacherResources}
        stageExtrasAvailable={!!scriptData.stage_extras_available}
        stageLevelData={stageLevelData}
        hasVerifiedResources={scriptData.has_verified_resources}
        hasLessonPlan={scriptData.has_lesson_plan}
        curriculumPath={scriptData.curriculum_path}
        pilotExperiment={scriptData.pilot_experiment}
        editorExperiment={scriptData.editor_experiment}
        announcements={announcements}
        supportedLocales={scriptData.supported_locales}
        locales={locales}
        projectSharing={scriptData.project_sharing}
        curriculumUmbrella={scriptData.curriculum_umbrella}
        familyName={scriptData.family_name}
        versionYear={scriptData.version_year}
        scriptFamilies={scriptEditorData.script_families}
        versionYearOptions={scriptEditorData.version_year_options}
      />
    </Provider>,
    document.querySelector('.edit_container')
  );
}

if (!IN_UNIT_TEST) {
  initPage(getScriptData('levelBuilderEditScript'));
}
