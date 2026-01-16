import React from 'react';

import RubricsContainer from '@cdo/apps/levelbuilder/rubrics/RubricsContainer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonData = getScriptData('lessonData');
  const {unitName, lessonNumber, levels} = lessonData;
  const lessonId = lessonData.id;
  const submittableLevels = levels.filter(
    level => level.properties.submittable === 'true'
  );

  createReactRoot(
    <RubricsContainer
      unitName={unitName}
      lessonNumber={lessonNumber}
      submittableLevels={submittableLevels}
      lessonId={lessonId}
    />,
    document.getElementById('form')
  );
});
