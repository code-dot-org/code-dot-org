import React from 'react';

import ChallengeGallery from '@cdo/apps/aiTutor/views/gallery/ChallengeGallery';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const {lessonId, lessonName} = getScriptData('tutorGalleryData');
  createReactRoot(
    <ChallengeGallery lessonId={lessonId} lessonName={lessonName} />,
    document.getElementById('tutor-gallery-container')
  );
});
