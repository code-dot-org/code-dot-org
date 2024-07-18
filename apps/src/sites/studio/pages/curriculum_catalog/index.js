import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {setSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
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

  ReactDOM.render(
    <Provider store={store}>
      <CurriculumCatalog
        curriculaData={curriculaData}
        isEnglish={isEnglish}
        languageNativeName={languageNativeName}
        isSignedOut={isSignedOut}
        isTeacher={isTeacher}
        isInUS={isInUS}
        curriculaTaught={curriculaTaught}
      />
    </Provider>,
    document.getElementById('curriculum-catalog-container')
  );
});
