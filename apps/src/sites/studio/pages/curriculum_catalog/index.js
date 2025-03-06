import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {setSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import experiments from '@cdo/apps/util/experiments';
import getScriptData from '@cdo/apps/util/getScriptData';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

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
  displayDifferentiationChat();
});

function displayDifferentiationChat() {
  const aiDiffFabMountPoint = document.getElementById(
    'ai-differentiation-fab-mount-point'
  );

  if (aiDiffFabMountPoint && experiments.isEnabled('ai-differentiation')) {
    ReactDOM.render(
      <Provider store={getStore()}>
        <AiDiffFloatingActionButton context={AiDiffContext.GENERAL} />
      </Provider>,
      aiDiffFabMountPoint
    );
  }
}
