import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import JoinSectionLinkAccountPage from '@cdo/apps/templates/sectionsRefresh/JoinSectionLinkAccountPage';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const sectionCode = getScriptData('sectionCode');

  ReactDOM.render(
    <JoinSectionLinkAccountPage sectionCode={sectionCode} />,
    document.getElementById('join-section-link-account-page')
  );
});
