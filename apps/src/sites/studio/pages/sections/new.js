import {Heading1} from '@code-dot-org/component-library/typography';
import React from 'react';
import ReactDOM from 'react-dom';

import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import getScriptData from '@cdo/apps/util/getScriptData';
import i18n from '@cdo/locale';

import moduleStyles from './sections.module.scss';

$(document).ready(() => {
  const isUsersFirstSection = getScriptData('isUsersFirstSection');
  const canEnableAITutor = getScriptData('canEnableAITutor');
  const userCountry = getScriptData('userCountry');

  ReactDOM.render(
    <div className={moduleStyles.containerWithMarginTop}>
      <Heading1>{i18n.setUpClassSectionsHeader()}</Heading1>
      <SectionsSetUpContainer
        isUsersFirstSection={isUsersFirstSection}
        canEnableAITutor={canEnableAITutor}
        userCountry={userCountry}
        defaultRedirectUrl="/home"
      />
    </div>,
    document.getElementById('form')
  );
});
