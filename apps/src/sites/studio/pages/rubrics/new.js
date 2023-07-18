import React from 'react';
import ReactDOM from 'react-dom';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';

$(document).ready(() => {
  ReactDOM.render(<RubricsContainer />, document.getElementById('form'));
});
