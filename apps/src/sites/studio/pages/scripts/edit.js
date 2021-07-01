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
} from '@cdo/apps/lib/levelbuilder/unit-editor/unitEditorRedux';
import createResourcesReducer, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import UnitEditor from '@cdo/apps/lib/levelbuilder/unit-editor/UnitEditor';

export default function initPage(unitEditorData) {
  const scriptData = unitEditorData.script;
  const lessonLevelData = unitEditorData.lessonLevelData;
  const lessonGroups = mapLessonGroupDataForEditor(scriptData.lesson_groups);

  const locales = unitEditorData.locales;

  registerReducers({
    ...reducers,
    resources: createResourcesReducer('teacherResource'),
    studentResources: createResourcesReducer('studentResource'),
    isRtl
  });
  const store = getStore();
  store.dispatch(init(lessonGroups, unitEditorData.levelKeyList));
  const teacherResources = (scriptData.teacher_resources || []).map(
    ([type, link]) => ({
      type,
      link
    })
  );
  store.dispatch(
    initResources(
      'teacherResource',
      scriptData.migrated_teacher_resources || []
    ),
    initResources('studentResource', scriptData.student_resources || [])
  );

  let announcements = scriptData.announcements || [];

  ReactDOM.render(
    <Provider store={store}>
      <UnitEditor
        id={scriptData.id}
        name={unitEditorData.script.name}
        i18nData={unitEditorData.i18n}
        initialPublishedState={scriptData.publishedState}
        initialDeprecated={scriptData.deprecated}
        initialLoginRequired={scriptData.loginRequired}
        initialHideableLessons={scriptData.hideable_lessons}
        initialStudentDetailProgressView={
          scriptData.student_detail_progress_view
        }
        initialProfessionalLearningCourse={
          scriptData.professionalLearningCourse || ''
        }
        initialOnlyInstructorReviewRequired={
          scriptData.only_instructor_review_required
        }
        initialPeerReviewsRequired={scriptData.peerReviewsRequired}
        initialWrapupVideo={scriptData.wrapupVideo || ''}
        initialProjectWidgetVisible={scriptData.project_widget_visible}
        initialProjectWidgetTypes={scriptData.project_widget_types || []}
        initialTeacherResources={teacherResources}
        initialLessonExtrasAvailable={!!scriptData.lesson_extras_available}
        initialLessonLevelData={lessonLevelData}
        initialHasVerifiedResources={scriptData.has_verified_resources}
        initialCurriculumPath={scriptData.curriculum_path || ''}
        initialPilotExperiment={scriptData.pilot_experiment || ''}
        initialEditorExperiment={scriptData.editor_experiment || ''}
        initialAnnouncements={announcements}
        initialSupportedLocales={scriptData.supported_locales || []}
        initialLocales={locales}
        initialProjectSharing={scriptData.project_sharing || false}
        initialCurriculumUmbrella={scriptData.curriculum_umbrella || ''}
        initialFamilyName={scriptData.family_name || ''}
        initialVersionYear={scriptData.version_year || ''}
        initialIsMakerUnit={scriptData.is_maker_unit || false}
        unitFamilies={unitEditorData.script_families}
        versionYearOptions={unitEditorData.version_year_options}
        isLevelbuilder={unitEditorData.is_levelbuilder}
        initialTts={scriptData.tts}
        /* isCourse controls whether this Script/Unit is intended to be the root of a CourseOffering version.
         * hasCourse indicates whether this Script/Unit is part of a UnitGroup. These two in theory should be
         * complements, but currently (August 2020) they are not, so they are separate fields for now. */
        initialIsCourse={scriptData.is_course}
        hasCourse={unitEditorData.has_course}
        initialShowCalendar={scriptData.showCalendar}
        initialWeeklyInstructionalMinutes={
          scriptData.weeklyInstructionalMinutes
        }
        initialCourseVersionId={scriptData.courseVersionId}
        isMigrated={scriptData.is_migrated}
        initialIncludeStudentLessonPlans={
          scriptData.includeStudentLessonPlans || false
        }
        scriptPath={scriptData.scriptPath}
      />
    </Provider>,
    document.querySelector('.edit_container')
  );
}

if (!IN_UNIT_TEST) {
  initPage(getScriptData('levelBuilderEditScript'));
}
