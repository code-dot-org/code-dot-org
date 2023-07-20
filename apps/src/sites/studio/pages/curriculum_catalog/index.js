import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import CurriculumCatalog from '../../../../templates/curriculumCatalog/CurriculumCatalog';
import getScriptData from '@cdo/apps/util/getScriptData';
import {setSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

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
      />
    </Provider>,
    document.getElementById('curriculum-catalog-container')
  );
});
