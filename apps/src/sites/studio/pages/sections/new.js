import {Typography} from '@mui/material';
import React from 'react';

import {displayDifferentiationChat} from '@cdo/apps/aiDifferentiation/aiDiffUtils';
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
      <SectionsSetUpContainer
        isUsersFirstSection={isUsersFirstSection}
        userCountry={userCountry}
        defaultRedirectUrl={defaultRedirectUrl}
      />
    </div>,
    document.getElementById('form')
  );
  displayDifferentiationChat();
});
