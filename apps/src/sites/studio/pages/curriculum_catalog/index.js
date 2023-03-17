import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';

$(document).ready(function() {
  const script = document.querySelector('script[data-curricula]');
  const curriculaData = JSON.parse(script.dataset.curricula);

  ReactDOM.render(
    <Provider store={getStore()}>
      <>
        <h1>Curriculum Catalog!</h1>
        {curriculaData.map(curriculum => (
          <li key={curriculum.key}>{curriculum.display_name}</li>
        ))}
      </>
    </Provider>,
    document.getElementById('curriculum-catalog-container')
  );
});
