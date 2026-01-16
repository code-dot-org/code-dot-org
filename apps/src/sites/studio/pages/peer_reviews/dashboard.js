import React from 'react';

import PeerReviewSubmissions from '@cdo/apps/code-studio/peer_reviews/PeerReviewSubmissions';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  createReactRoot(
    <PeerReviewSubmissions
      courseList={getScriptData('courseList')}
      courseUnitMap={getScriptData('courseUnitMap')}
    />,
    document.getElementById('dashboard-container')
  );
});
