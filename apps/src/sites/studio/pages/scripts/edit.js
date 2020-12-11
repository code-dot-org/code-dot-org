/** @file JavaScript run only on the /s/:script_name/edit page. */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import getScriptData from '@cdo/apps/util/getScriptData';
import reducers, {
  init,
  mapLessonGroupDataForEditor
} from '@cdo/apps/lib/levelbuilder/script-editor/scriptEditorRedux';
import ScriptEditor from '@cdo/apps/lib/levelbuilder/script-editor/ScriptEditor';
import {valueOr} from '@cdo/apps/utils';

export default function initPage(scriptEditorData) {
  const scriptData = scriptEditorData.script;
  const lessonLevelData = scriptEditorData.lessonLevelData;
  const lessonGroups = mapLessonGroupDataForEditor(scriptData.lesson_groups);

  const locales = scriptEditorData.locales;

  registerReducers({...reducers, isRtl});
  const store = getStore();
  store.dispatch(init(lessonGroups, scriptEditorData.levelKeyList));

  const teacherResources = (scriptData.teacher_resources || []).map(
    ([type, link]) => ({type, link})
  );

  let announcements = scriptData.announcements || [];

  ReactDOM.render(
    <Provider store={store}>
      <ScriptEditor
        id={scriptData.id}
        name={scriptEditorData.script.name}
        i18nData={scriptEditorData.i18n}
        initialHidden={valueOr(scriptData.hidden, true)}
        initialIsStable={scriptData.is_stable}
        initialLoginRequired={scriptData.loginRequired}
        initialHideableLessons={scriptData.hideable_lessons}
        initialStudentDetailProgressView={
          scriptData.student_detail_progress_view
        }
        initialProfessionalLearningCourse={
          scriptData.professionalLearningCourse || ''
        }
        initialPeerReviewsRequired={scriptData.peerReviewsRequired}
        initialWrapupVideo={scriptData.wrapupVideo || ''}
        initialProjectWidgetVisible={scriptData.project_widget_visible}
        initialProjectWidgetTypes={scriptData.project_widget_types || []}
        initialTeacherResources={teacherResources}
        initialLessonExtrasAvailable={!!scriptData.lesson_extras_available}
        initialLessonLevelData={
          lessonLevelData ||
          "lesson_group 'lesson group', display_name: 'lesson group display name'\nlesson 'new lesson', display_name: 'lesson display name'\n"
        }
        initialHasVerifiedResources={scriptData.has_verified_resources}
        initialHasLessonPlan={scriptData.has_lesson_plan}
        initialCurriculumPath={scriptData.curriculum_path || ''}
        initialPilotExperiment={scriptData.pilot_experiment}
        initialEditorExperiment={scriptData.editor_experiment || ''}
        initialAnnouncements={announcements}
        initialSupportedLocales={scriptData.supported_locales || []}
        initialLocales={locales}
        initialProjectSharing={scriptData.project_sharing || false}
        initialCurriculumUmbrella={scriptData.curriculum_umbrella || ''}
        initialFamilyName={scriptData.family_name || ''}
        initialVersionYear={scriptData.version_year || ''}
        scriptFamilies={scriptEditorData.script_families}
        versionYearOptions={scriptEditorData.version_year_options}
        isLevelbuilder={scriptEditorData.is_levelbuilder}
        initialTts={scriptData.tts}
        /* isCourse controls whether this Script/Unit is intended to be the root of a CourseOffering version.
         * hasCourse indicates whether this Script/Unit is part of a UnitGroup. These two in theory should be
         * complements, but currently (August 2020) they are not, so they are separate fields for now. */
        initialIsCourse={scriptData.is_course}
        hasCourse={scriptEditorData.has_course}
        initialShowCalendar={scriptData.showCalendar}
        isMigrated={scriptData.is_migrated}
      />
    </Provider>,
    document.querySelector('.edit_container')
  );
}

if (!IN_UNIT_TEST) {
  initPage(getScriptData('levelBuilderEditScript'));
}
