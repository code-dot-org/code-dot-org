import React from 'react';
import ReactDOM from 'react-dom';
import NewScriptForm from '@cdo/apps/lib/levelbuilder/script-editor/NewScriptForm';

$(document).ready(() => {
  ReactDOM.render(<NewScriptForm />, document.getElementById('form'));
});
