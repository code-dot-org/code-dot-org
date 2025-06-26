import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import SkillEvaluationSettings from '@cdo/apps/levelbuilder/skills/SkillEvaluationSettings';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const data = getScriptData('skillevaluationdata');
  ReactDOM.render(
    <SkillEvaluationSettings skills={data} />,
    document.getElementById('skill-evaluation-settings-editor')
  );
});
