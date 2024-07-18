import React from 'react';
import {createRoot} from 'react-dom/client';

import PeerReviewSubmissions from '@cdo/apps/code-studio/peer_reviews/PeerReviewSubmissions';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const root = createRoot(document.getElementById('dashboard-container'));

  root.render(
    <PeerReviewSubmissions
      courseList={getScriptData('courseList')}
      courseUnitMap={getScriptData('courseUnitMap')}
    />
  );
});
