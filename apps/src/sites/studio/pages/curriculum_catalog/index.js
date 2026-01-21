import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import {displayDifferentiationChat} from '@cdo/apps/aiDifferentiation/aiDiffUtils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {setSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

import CurriculumCatalog from '../../../../templates/curriculumCatalog/CurriculumCatalog';

$(document).ready(function () {
  const catalogData = getScriptData('catalog');
  const {
    curriculaData,
    isEnglish,
    languageEnglishName,
    languageNativeName,
    sections,
    isSignedOut,
    isTeacher,
    isInUS,
    curriculaTaught,
  } = catalogData;

  const store = getStore();
  sections && store.dispatch(setSections(sections));

  analyticsReporter.sendEvent(EVENTS.CURRICULUM_CATALOG_VISITED_EVENT, {
    language: languageEnglishName,
  });

  const root = createRoot(document.getElementById('curriculum-catalog-container'));

  root.render(<Provider store={store}>
    <CurriculumCatalog
      curriculaData={curriculaData}
      isEnglish={isEnglish}
      languageNativeName={languageNativeName}
      isSignedOut={isSignedOut}
      isTeacher={isTeacher}
      isInUS={isInUS}
      curriculaTaught={curriculaTaught}
    />
  </Provider>);

  displayDifferentiationChat();
});
