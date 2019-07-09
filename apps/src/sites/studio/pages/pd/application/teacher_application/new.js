import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/application/teacher1920/Teacher1920Application').then(
  ({default: Teacher1920Application}) => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <Teacher1920Application {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
