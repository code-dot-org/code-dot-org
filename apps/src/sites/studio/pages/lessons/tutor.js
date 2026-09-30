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
  createReactRoot(
    <Provider store={getStore()}>
      <BrowserRouter basename={basename}>
        <TutorApp
          lessonDeepDiveData={lessonDeepDiveData}
          tutorGalleryData={tutorGalleryData}
        />
      </BrowserRouter>
    </Provider>,
    document.getElementById('tutor-app-container')
  );
});
