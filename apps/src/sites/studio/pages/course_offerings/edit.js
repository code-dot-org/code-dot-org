import React from 'react';
import {createRoot} from 'react-dom/client';

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

  const videos = getScriptData('videos');

  const root = createRoot(document.getElementById('course_offering_editor'));

  root.render(
    <CourseOfferingEditor
      initialCourseOffering={courseOfferingEditorData}
      selfPacedPLCourseOfferings={selfPacedPLCourseOfferings}
      professionalLearningProgramPaths={professionalLearningProgramPaths}
      videos={videos}
    />
  );
}
