import React from 'react';
import ReactDOM from 'react-dom';

import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(initPage);

function initPage() {
  const section = getScriptData('section');
  const canEnableAITutor = getScriptData('canEnableAITutor');

  ReactDOM.render(
    <SectionsSetUpContainer
      sectionToBeEdited={section}
      canEnableAITutor={canEnableAITutor}
    />,
    document.getElementById('form')
  );
}
