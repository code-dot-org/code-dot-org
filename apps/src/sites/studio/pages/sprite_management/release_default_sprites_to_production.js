import React from 'react';
import ReactDOM from 'react-dom';

import ReleaseDefaultSprites from '@cdo/apps/code-studio/assets/ReleaseDefaultSprites';

$(document).ready(function () {
  ReactDOM.render(
    <ReleaseDefaultSprites />,
    document.getElementById('release-default-sprites-to-production-container')
  );
});
