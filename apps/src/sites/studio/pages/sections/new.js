import React from 'react';
import ReactDOM from 'react-dom';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';

$(document).ready(() => {
  ReactDOM.render(<SectionsSetUpContainer />, document.getElementById('form'));
});
