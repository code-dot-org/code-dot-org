import {
  ApiClientProvider,
  createApiClient,
  createKyTransport,
  resolveCsrfToken,
} from '@code-dot-org/core/api';
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
  // Same-origin so the requests ride the page's cookies and dev proxies.
  const apiClient = createApiClient(
    createKyTransport({
      baseUrl: window.location.origin,
      credentials: 'same-origin',
      getCsrfToken: resolveCsrfToken,
      // HttpClient had no timeout; ky defaults to 10 seconds.
      kyOptions: {timeout: false},
    })
  );
  createReactRoot(
    <ApiClientProvider client={apiClient}>
      <ChallengeGallery tutorGalleryData={tutorGalleryData} />
    </ApiClientProvider>,
    document.getElementById('tutor-gallery-container')
  );
});
