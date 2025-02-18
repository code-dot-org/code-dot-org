import React from 'react';
import ReactDOM from 'react-dom';

import DefaultSpritesEditor from '@cdo/apps/code-studio/assets/DefaultSpritesEditor';

$(document).ready(function () {
  ReactDOM.render(
    <DefaultSpritesEditor />,
    document.getElementById('default-sprites-editor-container')
  );
});
