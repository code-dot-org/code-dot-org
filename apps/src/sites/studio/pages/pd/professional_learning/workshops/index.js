import { createRoot } from "react-dom/client";
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

  const root = createRoot(document.getElementById('workshop-container'));

  root.render(<WorkshopMarketingPage
    {...workshopInfoParams}
    {...userInfoParams}
    userEnrollment={userEnrollmentParams}
  />);
});
