import React from 'react';
import ReactDOM from 'react-dom';
import CourseEditor from '@cdo/apps/lib/levelbuilder/course-editor/CourseEditor';
import createResourcesReducer, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {registerReducers} from '@cdo/apps/redux';

$(document).ready(showCourseEditor);

function showCourseEditor() {
  const unitData = document.querySelector('script[data-course-editor]');
  const courseEditorData = JSON.parse(unitData.dataset.courseEditor);

  const teacherResources = (
    courseEditorData.course_summary.teacher_resources || []
  ).map(([type, link]) => ({type, link}));

  registerReducers({
    resources: createResourcesReducer('teacherResource'),
    studentResources: createResourcesReducer('studentResource')
  });
  const store = getStore();
  store.dispatch(
    initResources(
      'teacherResource',
      courseEditorData.course_summary.migrated_teacher_resources || []
    ),
    initResources(
      'studentResource',
      courseEditorData.course_summary.student_resources || []
    )
  );

  let announcements = courseEditorData.course_summary.announcements || [];

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <Provider store={store}>
      <CourseEditor
        name={courseEditorData.course_summary.name}
        initialTitle={courseEditorData.course_summary.title}
        initialVersionTitle={courseEditorData.course_summary.version_title}
        initialFamilyName={courseEditorData.course_summary.family_name}
        initialVersionYear={courseEditorData.course_summary.version_year}
        initialPublishedState={courseEditorData.course_summary.published_state}
        initialPilotExperiment={
          courseEditorData.course_summary.pilot_experiment || ''
        }
        initialDescriptionShort={
          courseEditorData.course_summary.description_short
        }
        initialDescriptionStudent={
          courseEditorData.course_summary.description_student || ''
        }
        initialDescriptionTeacher={
          courseEditorData.course_summary.description_teacher || ''
        }
        initialUnitsInCourse={courseEditorData.course_summary.scripts.map(
          unit => unit.name
        )}
        unitNames={courseEditorData.script_names.sort()}
        initialTeacherResources={teacherResources}
        initialHasVerifiedResources={
          courseEditorData.course_summary.has_verified_resources
        }
        initialHasNumberedUnits={
          courseEditorData.course_summary.has_numbered_units
        }
        courseFamilies={courseEditorData.course_families}
        versionYearOptions={courseEditorData.version_year_options}
        initialAnnouncements={announcements}
        useMigratedResources={courseEditorData.course_summary.is_migrated}
        courseVersionId={courseEditorData.course_summary.course_version_id}
        coursePath={courseEditorData.course_summary.course_path}
      />
    </Provider>,
    document.getElementById('course_editor')
  );
}
