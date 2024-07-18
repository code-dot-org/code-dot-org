import React from 'react';
import {createRoot} from 'react-dom/client';

import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(initPage);

function initPage() {
  const section = getScriptData('section');
  const canEnableAITutor = getScriptData('canEnableAITutor');

  const root = createRoot(document.getElementById('form'));

  root.render(
    <SectionsSetUpContainer
      sectionToBeEdited={section}
      canEnableAITutor={canEnableAITutor}
    />
  );
}
