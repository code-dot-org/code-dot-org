import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import FrqAiEvaluationVaildationTool from '@cdo/apps/levelbuilder/level-editor/FrqAiEvaluationVaildationTool';

$(document).ready(function () {
  ReactDOM.render(
    <FrqAiEvaluationVaildationTool />,
    document.getElementById('frq-evaluation-settings-editor')
  );
});
