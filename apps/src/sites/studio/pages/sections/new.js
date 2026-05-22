import {Typography} from '@mui/material';
import React from 'react';

import {displayDifferentiationChat} from '@cdo/apps/aiDifferentiation/aiDiffUtils';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';
import {resumeCreateSectionOnboardingTour} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/useCreateSectionTour';
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
      <SectionsSetUpContainer
        isUsersFirstSection={isUsersFirstSection}
        userCountry={userCountry}
        defaultRedirectUrl={defaultRedirectUrl}
      />
    </div>,
    document.getElementById('form'),
    {
      legacyReactDomRender: true,
    }
  );
  // TODO: This is hardcoded for now, but will need to incorporate logic around grade level and pass this in as a parameter in the future once we have the grade sign up flow
  resumeCreateSectionOnboardingTour(false);
  displayDifferentiationChat();
});
