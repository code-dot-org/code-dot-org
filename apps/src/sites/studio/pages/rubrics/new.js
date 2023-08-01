import React from 'react';
import ReactDOM from 'react-dom';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonData = getScriptData('lessonData');
  const unitName = lessonData.unit.displayName;
  const lessonNumber = lessonData.lessonNumber;
  const levels = lessonData.levels;

  ReactDOM.render(
    <RubricsContainer
      unitName={unitName}
      lessonNumber={lessonNumber}
      levels={levels}
    />,
    document.getElementById('form')
  );
});
