import React from 'react';

import LessonSlidesGenerator from '@cdo/apps/levelbuilder/lesson-slides-generator/LessonSlidesGenerator';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const lessonData = getScriptData('lesson');

  createReactRoot(
    <LessonSlidesGenerator lesson={lessonData} />,
    document.getElementById('generate-slides-container'),
    {
      legacyReactDomRender: true,
    }
  );
});
