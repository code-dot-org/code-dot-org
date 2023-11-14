import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';

$(document).ready(initPage);

function initPage() {
  const section = getScriptData('section');
  const canEnableAiTutor = getScriptData('canEnableAiTutor');

  ReactDOM.render(
    <SectionsSetUpContainer
      sectionToBeEdited={section}
      canEnableAiTutor={canEnableAiTutor}
    />,
    document.getElementById('form')
  );
}
