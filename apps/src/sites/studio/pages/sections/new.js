import {Heading1} from '@code-dot-org/component-library/typography';
import React from 'react';
import ReactDOM from 'react-dom';

import DCDO from '@cdo/apps/dcdo';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import experiments from '@cdo/apps/util/experiments';
import getScriptData from '@cdo/apps/util/getScriptData';
import i18n from '@cdo/locale';

import moduleStyles from './sections.module.scss';

$(document).ready(() => {
  const isUsersFirstSection = getScriptData('isUsersFirstSection');
  const canEnableAITutor = getScriptData('canEnableAITutor');
  const userCountry = getScriptData('userCountry');

  const defaultRedirectUrl =
    experiments.isEnabled('teacher-homepage-v2') ||
    DCDO.get('teacher-homepage-v2', false)
      ? '/teacher_dashboard/home'
      : '/home';

  ReactDOM.render(
    <div className={moduleStyles.containerWithMarginTop}>
      <Heading1>{i18n.setUpClassSectionsHeader()}</Heading1>
      <SectionsSetUpContainer
        isUsersFirstSection={isUsersFirstSection}
        canEnableAITutor={canEnableAITutor}
        userCountry={userCountry}
        defaultRedirectUrl={defaultRedirectUrl}
      />
    </div>,
    document.getElementById('form')
  );
});
