import React from 'react';
import ReactDOM from 'react-dom';

import WorkshopJoin from '@cdo/apps/code-studio/pd/workshop_enrollment/WorkshopJoin';
import {
  workshopInfoDataResponseToParams,
  userInfoDataResponseToParams,
} from '@cdo/apps/code-studio/pd/workshops/types';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const joinInfo = getScriptData('props');
  const workshopInfoParams = workshopInfoDataResponseToParams(
    joinInfo.workshop_info
  );
  const userInfoParams = userInfoDataResponseToParams(joinInfo.user_info);

  ReactDOM.render(
    <WorkshopJoin
      workshopEnrollmentStatus={joinInfo.workshop_enrollment_status}
      workshopInfo={workshopInfoParams}
      userInfo={userInfoParams.userInfo}
    />,
    document.getElementById('join-workshop-container')
  );
});
