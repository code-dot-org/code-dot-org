import React from 'react';
import ReactDOM from 'react-dom';
import CourseOfferingEditor from '@cdo/apps/lib/levelbuilder/CourseOfferingEditor';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(showCourseOfferingEditor);

function showCourseOfferingEditor() {
  const courseOfferingEditorData = getScriptData('courseOfferingEditor');

  const selfPacedPLCourseOfferings = getScriptData(
    'selfPacedPlCourseOfferings'
  );

  const professionalLearningProgramPaths = getScriptData(
    'professionalLearningProgramPaths'
  );

  ReactDOM.render(
    <CourseOfferingEditor
      initialCourseOffering={courseOfferingEditorData}
      selfPacedPLCourseOfferings={selfPacedPLCourseOfferings}
      professionalLearningProgramPaths={professionalLearningProgramPaths}
    />,
    document.getElementById('course_offering_editor')
  );
}
