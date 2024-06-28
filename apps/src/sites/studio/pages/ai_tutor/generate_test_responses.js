import React from 'react';
import ReactDOM from 'react-dom';
import AITutorResponseGenerator from '@cdo/apps/lib/levelbuilder/ai-tutor-response-generator/AITutorResponseGenerator';

$(document).ready(() => {
  ReactDOM.render(<AITutorResponseGenerator />, document.getElementById('generator'));
});