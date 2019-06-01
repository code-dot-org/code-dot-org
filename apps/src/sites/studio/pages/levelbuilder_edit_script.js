/** @file JavaScript run only on the /s/:script_name/edit page. */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import getScriptData from '@cdo/apps/util/getScriptData';
import ScriptEditor from '@cdo/apps/lib/script-editor/ScriptEditor';
import {valueOr} from '@cdo/apps/utils';

export default function initPage(scriptEditorData) {
  const scriptData = scriptEditorData.script;
  const stageLevelData = scriptEditorData.stageLevelData;
  const locales = scriptEditorData.locales;

  registerReducers({isRtl});

  const teacherResources = (scriptData.teacher_resources || []).map(
    ([type, link]) => ({type, link})
  );

  let announcements = scriptData.script_announcements || [];

  ReactDOM.render(
    <Provider store={getStore()}>
      <ScriptEditor
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
        announcements={announcements}
        supportedLocales={scriptData.supported_locales}
        locales={locales}
        projectSharing={scriptData.project_sharing}
        curriculumUmbrella={scriptData.curriculum_umbrella}
      />
    </Provider>,
    document.querySelector('.edit_container')
  );
}

if (!IN_UNIT_TEST) {
  initPage(getScriptData('levelBuilderEditScript'));
}
