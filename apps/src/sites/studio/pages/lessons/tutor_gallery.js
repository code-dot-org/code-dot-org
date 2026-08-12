import React from 'react';

import ChallengeGallery from '@cdo/apps/aiTutor/views/gallery/ChallengeGallery';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const tutorGalleryData = getScriptData('tutorGalleryData');
  createReactRoot(
    <ChallengeGallery tutorGalleryData={tutorGalleryData} />,
    document.getElementById('tutor-gallery-container')
  );
});
