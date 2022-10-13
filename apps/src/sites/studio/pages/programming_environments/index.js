import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ProgrammingEnvironmentIndex from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentIndex';

$(document).ready(() => {
  const programmingEnvironments = getScriptData('programmingEnvironments');
  ReactDOM.render(
    <ProgrammingEnvironmentIndex
      programmingEnvironments={programmingEnvironments}
    />,
    document.getElementById('container')
  );
});
