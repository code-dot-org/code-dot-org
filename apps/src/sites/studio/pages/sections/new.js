import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';

$(document).ready(() => {
  const isUsersFirstSection = getScriptData('isUsersFirstSection');
  const canEnableAITutor = getScriptData('canEnableAITutor');
  const showChildAccountPolicy = getScriptData('showChildAccountPolicy');

  ReactDOM.render(
    <SectionsSetUpContainer
      isUsersFirstSection={isUsersFirstSection}
      canEnableAITutor={canEnableAITutor}
      showChildAccountPolicy={showChildAccountPolicy}
    />,
    document.getElementById('form')
  );
});
