import React from 'react';
import {createRoot} from 'react-dom/client';

import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonData = getScriptData('lessonData');
  const {unitName, lessonNumber, levels} = lessonData;
  const lessonId = lessonData.id;
  const submittableLevels = levels.filter(
    level => level.properties.submittable === 'true'
  );

  const root = createRoot(document.getElementById('form'));

  root.render(
    <RubricsContainer
      unitName={unitName}
      lessonNumber={lessonNumber}
      submittableLevels={submittableLevels}
      lessonId={lessonId}
    />
  );
});
