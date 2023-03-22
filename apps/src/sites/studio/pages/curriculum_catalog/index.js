import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import CurriculumCatalog from '../../../../templates/curriculumCatalog/CurriculumCatalog';

$(document).ready(function() {
  const script = document.querySelector('script[data-curricula]');
  const curriculaData = JSON.parse(script.dataset.curricula);

  ReactDOM.render(
    <Provider store={getStore()}>
      <CurriculumCatalog curriculaData={curriculaData} />
    </Provider>,
    document.getElementById('curriculum-catalog-container')
  );
});
