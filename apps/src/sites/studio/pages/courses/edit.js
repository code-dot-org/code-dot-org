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
  const scriptData = document.querySelector('script[data-course-editor]');
  const courseEditorData = JSON.parse(scriptData.dataset.courseEditor);

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
        title={courseEditorData.course_summary.title}
        versionTitle={courseEditorData.course_summary.version_title}
        familyName={courseEditorData.course_summary.family_name}
        versionYear={courseEditorData.course_summary.version_year}
        initialVisible={courseEditorData.course_summary.visible}
        isStable={courseEditorData.course_summary.is_stable}
        initialPilotExperiment={
          courseEditorData.course_summary.pilot_experiment
        }
        descriptionShort={courseEditorData.course_summary.description_short}
        initialDescriptionStudent={
          courseEditorData.course_summary.description_student || ''
        }
        initialDescriptionTeacher={
          courseEditorData.course_summary.description_teacher || ''
        }
        scriptsInCourse={courseEditorData.course_summary.scripts.map(
          script => script.name
        )}
        scriptNames={courseEditorData.script_names.sort()}
        initialTeacherResources={teacherResources}
        hasVerifiedResources={
          courseEditorData.course_summary.has_verified_resources
        }
        hasNumberedUnits={courseEditorData.course_summary.has_numbered_units}
        courseFamilies={courseEditorData.course_families}
        versionYearOptions={courseEditorData.version_year_options}
        initialAnnouncements={announcements}
        useMigratedResources={courseEditorData.course_summary.is_migrated}
        courseVersionId={courseEditorData.course_summary.course_version_id}
      />
    </Provider>,
    document.getElementById('course_editor')
  );
}
