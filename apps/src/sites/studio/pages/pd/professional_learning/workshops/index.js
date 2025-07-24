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

  ReactDOM.render(
    <WorkshopMarketingPage {...workshopInfoParams} {...userInfoParams} />,
    document.getElementById('workshop-container')
  );
});
