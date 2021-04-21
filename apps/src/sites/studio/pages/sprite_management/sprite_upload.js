import React from 'react';
import ReactDOM from 'react-dom';
import SpriteUpload from '@cdo/apps/code-studio/assets/SpriteUpload';

$(document).ready(function() {
  ReactDOM.render(
    <SpriteUpload />,
    document.getElementById('sprite-upload-container')
  );
});
