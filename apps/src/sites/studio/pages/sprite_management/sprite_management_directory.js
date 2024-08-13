import React from 'react';
import ReactDOM from 'react-dom';

import SpriteManagementDirectory from '@cdo/apps/code-studio/assets/SpriteManagementDirectory';

$(document).ready(function () {
  ReactDOM.render(
    <SpriteManagementDirectory />,
    document.getElementById('sprite-management-directory-container')
  );
});
