import React from 'react';
import ReactDOM from 'react-dom';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonData = getScriptData('lessonData');
  const {unitName, lessonNumber, levels} = lessonData;
  const lessonId = lessonData.id;
  const hasSubmittableLevels =
    levels.filter(level => level.properties.submittable === 'true').length !==
    0;

  ReactDOM.render(
    <RubricsContainer
      unitName={unitName}
      lessonNumber={lessonNumber}
      levels={levels}
      lessonId={lessonId}
      hasSubmittableLevels={hasSubmittableLevels}
    />,
    document.getElementById('form')
  );
});
