import React from 'react';
import ReactDOM from 'react-dom';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const rubric = getScriptData('rubricData');
  const lessonData = getScriptData('lessonData');
  const unitName = lessonData.unitName;
  const lessonNumber = lessonData.lessonNumber;
  const levels = lessonData.levels;

  ReactDOM.render(
    <RubricsContainer
      unitName={unitName}
      lessonNumber={lessonNumber}
      levels={levels}
      rubric={rubric}
    />,
    document.getElementById('form')
  );
});
