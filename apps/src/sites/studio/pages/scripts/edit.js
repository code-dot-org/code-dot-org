/** @file JavaScript run only on the /s/:script_name/edit page. */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/levelbuilder/lesson-editor/resourcesEditorRedux';
import UnitEditor from '@cdo/apps/levelbuilder/unit-editor/UnitEditor';
import reducers, {
  init,
  mapLessonGroupDataForEditor,
} from '@cdo/apps/levelbuilder/unit-editor/unitEditorRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';

export default function initPage(unitEditorData) {
  const scriptData = unitEditorData.script;
  const lessonGroups = mapLessonGroupDataForEditor(scriptData.lesson_groups);

  const locales = unitEditorData.locales;

  registerReducers({
    ...reducers,
    resources: createResourcesReducer('teacherResource'),
    studentResources: createResourcesReducer('studentResource'),
    isRtl,
  });
  const store = getStore();
  store.dispatch(init(lessonGroups));
  store.dispatch(
    initResources('teacherResource', scriptData.teacher_resources || []),
    initResources('studentResource', scriptData.student_resources || [])
  );

  ReactDOM.render(
    <Provider store={store}>
      <UnitEditor
        id={scriptData.id}
        name={unitEditorData.script.name}
        i18nData={unitEditorData.i18n}
        initialPublishedState={scriptData.coursePublishedState}
        initialHideWithinCourse={scriptData.hide_within_course}
        initialDeprecated={scriptData.deprecated}
        initialLoginRequired={scriptData.loginRequired}
        initialHideableLessons={scriptData.hideable_lessons}
        initialStudentDetailProgressView={
          scriptData.student_detail_progress_view
        }
        initialProfessionalLearningCourse={
          scriptData.deeperLearningCourse || ''
        }
        initialOnlyInstructorReviewRequired={
          scriptData.only_instructor_review_required
        }
        initialPeerReviewsRequired={scriptData.peerReviewsRequired}
        initialWrapupVideo={scriptData.wrapupVideo || ''}
        initialProjectWidgetVisible={scriptData.project_widget_visible}
        initialProjectWidgetTypes={scriptData.project_widget_types || []}
        initialLastUpdatedAt={scriptData.updated_at}
        initialLessonExtrasAvailable={!!scriptData.lesson_extras_available}
        initialHasUnnumberedLessons={scriptData.hasUnnumberedLessons}
        initialHasVerifiedResources={scriptData.has_verified_resources}
        initialCurriculumPath={scriptData.curriculum_path || ''}
        initialEditorExperiment={scriptData.editor_experiment || ''}
        initialAnnouncements={scriptData.announcements || []}
        initialSupportedLocales={scriptData.supported_locales || []}
        initialLocales={locales}
        initialProjectSharing={scriptData.project_sharing || false}
        initialCurriculumUmbrella={scriptData.curriculum_umbrella || ''}
        initialTopicTags={scriptData.topic_tags || []}
        initialContentArea={scriptData.content_area || ''}
        isLevelbuilder={unitEditorData.is_levelbuilder}
        initialTts={scriptData.tts}
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
        initialUseLegacyLessonPlans={scriptData.useLegacyLessonPlans || false}
        scriptPath={scriptData.scriptPath}
        courseOfferingEditorLink={scriptData.courseOfferingEditPath}
        isCSDCourseOffering={scriptData.isCSDCourseOffering}
        isMissingRequiredDeviceCompatibilities={
          scriptData.missingRequiredDeviceCompatibilities
        }
        allowMajorCurriculumChanges={scriptData.allowMajorCurriculumChanges}
        initialEnableBlocklyKeyboardNavigation={
          scriptData.enableBlocklyKeyboardNavigation
        }
      />
    </Provider>,
    document.querySelector('.edit_container')
  );
}

if (!IN_UNIT_TEST) {
  initPage(getScriptData('levelBuilderEditScript'));
}
