/** @file JavaScript run only on the /s/:script_name/edit page. */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import getScriptData from '@cdo/apps/util/getScriptData';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import ScriptEditor from '@cdo/apps/lib/levelbuilder/script-editor/ScriptEditor';
import {valueOr} from '@cdo/apps/utils';

export default function initPage(scriptEditorData) {
  const scriptData = scriptEditorData.script;
  const lessonLevelData = scriptEditorData.lessonLevelData;
  const lesson_groups = (scriptData.lesson_groups || [])
    .filter(lesson_group => lesson_group.id)
    .map(lesson_group => ({
      key: lesson_group.key,
      display_name: lesson_group.display_name,
      user_facing: lesson_group.user_facing,
      position: lesson_group.position,
      description: lesson_group.description,
      big_questions: lesson_group.big_questions,
      lessons: lesson_group.lessons
        .filter(lesson => lesson.id)
        .map(lesson => ({
          id: lesson.id,
          key: lesson.key,
          position: lesson.position,
          relativePosition: lesson.relative_position,
          lockable: lesson.lockable,
          name: lesson.name,
          assessment: lesson.assessment,
          unplugged: lesson.unplugged
        }))
    }));
  const locales = scriptEditorData.locales;

  registerReducers({...reducers, isRtl});
  const store = getStore();
  store.dispatch(init(lesson_groups));

  const teacherResources = (scriptData.teacher_resources || []).map(
    ([type, link]) => ({type, link})
  );

  let announcements = scriptData.announcements || [];

  ReactDOM.render(
    <Provider store={store}>
      <ScriptEditor
        beta={scriptEditorData.beta}
        betaWarning={scriptEditorData.betaWarning}
        name={scriptEditorData.script.name}
        i18nData={scriptEditorData.i18n}
        hidden={valueOr(scriptData.hidden, true)}
        isStable={scriptData.is_stable}
        loginRequired={scriptData.loginRequired}
        hideableLessons={scriptData.hideable_lessons}
        studentDetailProgressView={scriptData.student_detail_progress_view}
        professionalLearningCourse={scriptData.professionalLearningCourse}
        peerReviewsRequired={scriptData.peerReviewsRequired}
        wrapupVideo={scriptData.wrapupVideo}
        projectWidgetVisible={scriptData.project_widget_visible}
        projectWidgetTypes={scriptData.project_widget_types}
        teacherResources={teacherResources}
        lessonExtrasAvailable={!!scriptData.lesson_extras_available}
        lessonLevelData={lessonLevelData}
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
        isLevelbuilder={scriptEditorData.is_levelbuilder}
        tts={scriptData.tts}
        /* isCourse controls whether this Script/Unit is intended to be the root of a CourseOffering version.
         * hasCourse indicates whether this Script/Unit is part of a UnitGroup. These two in theory should be
         * complements, but currently (August 2020) they are not, so they are separate fields for now. */
        isCourse={scriptData.is_course}
        hasCourse={scriptEditorData.has_course}
      />
    </Provider>,
    document.querySelector('.edit_container')
  );
}

if (!IN_UNIT_TEST) {
  initPage(getScriptData('levelBuilderEditScript'));
}
