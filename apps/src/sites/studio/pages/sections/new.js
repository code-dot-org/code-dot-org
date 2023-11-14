import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';

$(document).ready(() => {
  const isUsersFirstSection = getScriptData('isUsersFirstSection');
  const canEnableAiTutor = getScriptData('canEnableAiTutor');

  ReactDOM.render(
    <SectionsSetUpContainer
      isUsersFirstSection={isUsersFirstSection}
      canEnableAiTutor={canEnableAiTutor}
    />,
    document.getElementById('form')
  );
});
