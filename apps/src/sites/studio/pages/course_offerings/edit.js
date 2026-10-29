import React from 'react';

import CourseOfferingEditor from '@cdo/apps/levelbuilder/CourseOfferingEditor';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
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

  const videos = getScriptData('videos');

  const facilitatorsCourses = getScriptData('facilitatorsCourses');

  createReactRoot(
    <CourseOfferingEditor
      initialCourseOffering={courseOfferingEditorData}
      selfPacedPLCourseOfferings={selfPacedPLCourseOfferings}
      professionalLearningProgramPaths={professionalLearningProgramPaths}
      videos={videos}
      facilitatorsCourses={facilitatorsCourses}
    />,
    document.getElementById('course_offering_editor')
  );
}
