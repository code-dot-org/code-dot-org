import React from 'react';
import ReactDOM from 'react-dom';
import CourseEditor from '@cdo/apps/lib/levelbuilder/course-editor/CourseEditor';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';

$(document).ready(showCourseEditor);

function showCourseEditor() {
  const scriptData = document.querySelector('script[data-course-editor]');
  const courseEditorData = JSON.parse(scriptData.dataset.courseEditor);

  const teacherResources = (
    courseEditorData.course_summary.teacher_resources || []
  ).map(([type, link]) => ({type, link}));

  let announcements = courseEditorData.course_summary.announcements || [];

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <Provider store={getStore()}>
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
      />
    </Provider>,
    document.getElementById('course_editor')
  );
}
