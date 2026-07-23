import {resumeCreateSectionOnboardingTour} from '@code-dot-org/teacher-dashboard/home';
import {Typography} from '@mui/material';
import React from 'react';
import {Provider} from 'react-redux';

import {displayDifferentiationChat} from '@cdo/apps/aiDifferentiation/aiDiffUtils';
import {getStore} from '@cdo/apps/redux';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';
import i18n from '@cdo/locale';

import moduleStyles from './sections.module.scss';

$(document).ready(() => {
  const isUsersFirstSection = getScriptData('isUsersFirstSection');
  const userCountry = getScriptData('userCountry');

  const defaultRedirectUrl = '/teacher_dashboard/home';

  createReactRoot(
    <div className={moduleStyles.containerWithMarginTop}>
      <Typography variant="h1" gutterBottom>
        {i18n.setUpClassSectionsHeader()}
      </Typography>
      <Provider store={getStore()}>
        <SectionsSetUpContainer
          isUsersFirstSection={isUsersFirstSection}
          userCountry={userCountry}
          defaultRedirectUrl={defaultRedirectUrl}
        />
      </Provider>
    </div>,
    document.getElementById('form'),
    {
      legacyReactDomRender: true,
    }
  );
  resumeCreateSectionOnboardingTour();
  displayDifferentiationChat();
});
