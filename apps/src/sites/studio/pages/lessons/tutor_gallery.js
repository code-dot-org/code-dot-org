import {
  ApiClientProvider,
  createApiClient,
  createKyTransport,
} from '@code-dot-org/core/api';
import {TutorGalleryPage} from '@code-dot-org/lesson-deep-dive';
import React from 'react';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import experiments from '@cdo/apps/util/experiments';

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
  // Both URL grammars this page is routed at end in /tutor/gallery.
  const lessonPath = window.location.pathname.replace(
    /\/tutor\/gallery\/?$/,
    ''
  );
  // The gallery's requests are root-relative to the page's own origin, so
  // they ride the same cookie and the same dev proxies as the page. The
  // singleton DashboardApiClient is not used here: its base URL is absolute,
  // which would bypass the webpack dev proxy. No timeout: the HttpClient
  // calls this replaces had none, and ky's default is 10 seconds.
  const apiClient = createApiClient(
    createKyTransport({
      baseUrl: window.location.origin,
      credentials: 'same-origin',
      kyOptions: {timeout: false},
    })
  );
  createReactRoot(
    <ApiClientProvider client={apiClient}>
      <TutorGalleryPage lessonPath={lessonPath} />
    </ApiClientProvider>,
    document.getElementById('tutor-gallery-container')
  );
});
