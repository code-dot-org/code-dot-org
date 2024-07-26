import React from 'react';
import ReactDOM from 'react-dom';

import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const isUsersFirstSection = getScriptData('isUsersFirstSection');
  const canEnableAITutor = getScriptData('canEnableAITutor');
  const userCountry = getScriptData('userCountry');

  ReactDOM.render(
    <SectionsSetUpContainer
      isUsersFirstSection={isUsersFirstSection}
      canEnableAITutor={canEnableAITutor}
      userCountry={userCountry}
    />,
    document.getElementById('form')
  );
});
