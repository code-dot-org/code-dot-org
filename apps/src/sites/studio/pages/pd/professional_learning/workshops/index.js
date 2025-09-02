import React from 'react';
import ReactDOM from 'react-dom';

import {
  workshopInfoDataResponseToParams,
  userInfoDataResponseToParams,
} from '@cdo/apps/code-studio/pd/workshops/types';
import WorkshopMarketingPage from '@cdo/apps/code-studio/pd/workshops/WorkshopMarketingPage';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const workshopInfoParams = workshopInfoDataResponseToParams(
    getScriptData('workshopInfo')
  );
  const userInfoParams = userInfoDataResponseToParams(
    getScriptData('userInfo')
  );
  const userEnrollmentParams = getScriptData('userEnrollment');

  ReactDOM.render(
    <WorkshopMarketingPage
      {...workshopInfoParams}
      {...userInfoParams}
      userEnrollment={userEnrollmentParams}
    />,
    document.getElementById('workshop-container')
  );
});
