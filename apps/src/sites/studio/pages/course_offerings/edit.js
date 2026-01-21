import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import CourseOfferingEditor from '@cdo/apps/levelbuilder/CourseOfferingEditor';
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

  const root = createRoot(document.getElementById('course_offering_editor'));

  root.render(<CourseOfferingEditor
    initialCourseOffering={courseOfferingEditorData}
    selfPacedPLCourseOfferings={selfPacedPLCourseOfferings}
    professionalLearningProgramPaths={professionalLearningProgramPaths}
    videos={videos}
    facilitatorsCourses={facilitatorsCourses}
  />);
}
