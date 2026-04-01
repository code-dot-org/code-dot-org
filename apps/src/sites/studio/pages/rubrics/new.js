import React from 'react';

import RubricsContainer from '@cdo/apps/levelbuilder/rubrics/RubricsContainer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonData = getScriptData('lessonData');
  const {unitName, lessonNumber, levels, aiRubricS3Config} = lessonData;
  const lessonId = lessonData.id;
  const submittableLevels = levels.filter(level => level.isSubmittable);

  createReactRoot(
    <RubricsContainer
      unitName={unitName}
      lessonNumber={lessonNumber}
      submittableLevels={submittableLevels}
      lessonId={lessonId}
      aiRubricS3Config={aiRubricS3Config}
    />,
    document.getElementById('form'),
    {
      legacyReactDomRender: true,
    }
  );
});
