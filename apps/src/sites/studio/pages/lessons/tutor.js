import {
  ApiClientProvider,
  createApiClient,
  createKyTransport,
  resolveCsrfToken,
} from '@code-dot-org/core/api';
import React from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';

import TutorApp from '@cdo/apps/aiTutor/views/TutorApp';
import {getStore} from '@cdo/apps/redux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const lessonDeepDiveData = getScriptData('lessonDeepDiveData');
  const tutorGalleryData = getScriptData('tutorGalleryData');
  // Trim the URL to /tutor so BrowserRouter routes are all relative to it.
  const basename = window.location.pathname.replace(/\/tutor.*$/, '/tutor');
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
    <Provider store={getStore()}>
      <ApiClientProvider client={apiClient}>
        <BrowserRouter basename={basename}>
          <TutorApp
            lessonDeepDiveData={lessonDeepDiveData}
            tutorGalleryData={tutorGalleryData}
          />
        </BrowserRouter>
      </ApiClientProvider>
    </Provider>,
    document.getElementById('tutor-app-container')
  );
});
