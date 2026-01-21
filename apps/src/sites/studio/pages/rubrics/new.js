import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import RubricsContainer from '@cdo/apps/levelbuilder/rubrics/RubricsContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonData = getScriptData('lessonData');
  const {unitName, lessonNumber, levels} = lessonData;
  const lessonId = lessonData.id;
  const submittableLevels = levels.filter(
    level => level.properties.submittable === 'true'
  );

  const root = createRoot(document.getElementById('form'));

  root.render(<RubricsContainer
    unitName={unitName}
    lessonNumber={lessonNumber}
    submittableLevels={submittableLevels}
    lessonId={lessonId}
  />);
});
