import React from 'react';
import ReactDOM from 'react-dom';
import SpriteLabAnimationUpload from '@cdo/apps/code-studio/assets/SpriteLabAnimationUpload';

$(document).ready(function() {
  ReactDOM.render(
    <SpriteLabAnimationUpload />,
    document.getElementById('sprite-upload-container')
  );
});
