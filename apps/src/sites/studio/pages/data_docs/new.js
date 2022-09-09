import React from 'react';
import ReactDOM from 'react-dom';
import NewDataDocForm from '@cdo/apps/lib/levelbuilder/data-docs-editor/NewDataDocForm';

$(document).ready(() => {
  ReactDOM.render(<NewDataDocForm />, document.getElementById('form'));
});
