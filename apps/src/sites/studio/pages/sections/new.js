import React from 'react';
import {createRoot} from 'react-dom/client';

import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const isUsersFirstSection = getScriptData('isUsersFirstSection');
  const canEnableAITutor = getScriptData('canEnableAITutor');
  const userCountry = getScriptData('userCountry');

  const root = createRoot(document.getElementById('form'));

  root.render(
    <SectionsSetUpContainer
      isUsersFirstSection={isUsersFirstSection}
      canEnableAITutor={canEnableAITutor}
      userCountry={userCountry}
    />
  );
});
