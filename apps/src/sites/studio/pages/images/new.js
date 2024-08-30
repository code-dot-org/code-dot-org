import React from 'react';
import ReactDOM from 'react-dom';

import UploadImageForm from '@cdo/apps/levelbuilder/lesson-editor/UploadImageForm';

$(document).ready(() => {
  ReactDOM.render(<UploadImageForm />, document.getElementById('form'));
});
