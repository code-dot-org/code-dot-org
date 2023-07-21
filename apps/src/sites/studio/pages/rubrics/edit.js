import React from 'react';
import ReactDOM from 'react-dom';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';

// Note that I will need to pass some data in here (perhaps the id of the rubric)
// Currently, this URL will work http://localhost-studio.code.org:3000/rubrics/12/edit
$(document).ready(() => {
  ReactDOM.render(<RubricsContainer />, document.getElementById('form'));
});
