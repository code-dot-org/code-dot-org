import React from 'react';

import LessonGenerator from '@cdo/apps/levelbuilder/lesson-generator/LessonGenerator';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const lessonData = getScriptData('lesson');

  createReactRoot(
    <LessonGenerator lesson={lessonData} />,
    document.getElementById('generate-container'),
    {
      legacyReactDomRender: true,
    }
  );
});
