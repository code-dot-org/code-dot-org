import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import CurriculumCatalog from '../../../../templates/curriculumCatalog/CurriculumCatalog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const catalogData = getScriptData('catalog');
  const {curriculaData, isEnglish} = catalogData;

  ReactDOM.render(
    <Provider store={getStore()}>
      <CurriculumCatalog curriculaData={curriculaData} isEnglish={isEnglish} />
    </Provider>,
    document.getElementById('curriculum-catalog-container')
  );
});
