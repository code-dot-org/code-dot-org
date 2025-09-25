import React from 'react';
import ReactDOM from 'react-dom';

import NewUnitForm from '@cdo/apps/levelbuilder/unit-editor/NewUnitForm';

$(document).ready(() => {
  ReactDOM.render(<NewUnitForm />, document.getElementById('form'));
});
