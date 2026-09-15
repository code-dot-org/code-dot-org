import React from 'react';

import ChallengeGallery from '@cdo/apps/aiTutor/views/gallery/ChallengeGallery';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import experiments from '@cdo/apps/util/experiments';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  // The gallery is part of the challenge activities feature, so it is gated
  // by the same experiment flag.
  if (
    !experiments.isEnabledAllowingQueryString(
      experiments.LESSON_TUTOR_CHALLENGE
    )
  ) {
    return;
  }
  const tutorGalleryData = getScriptData('tutorGalleryData');
  createReactRoot(
    <ChallengeGallery tutorGalleryData={tutorGalleryData} />,
    document.getElementById('tutor-gallery-container')
  );
});
