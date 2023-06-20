import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import CurriculumCatalog from '../../../../templates/curriculumCatalog/CurriculumCatalog';
import getScriptData from '@cdo/apps/util/getScriptData';
import {setSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

$(document).ready(function () {
  const catalogData = getScriptData('catalog');
  const {curriculaData, isEnglish, sections} = catalogData;

  const store = getStore();
  sections && store.dispatch(setSections(sections));

  ReactDOM.render(
    <Provider store={store}>
      <CurriculumCatalog curriculaData={curriculaData} isEnglish={isEnglish} />
    </Provider>,
    document.getElementById('curriculum-catalog-container')
  );
});
