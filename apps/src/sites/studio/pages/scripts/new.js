import React from 'react';
import ReactDOM from 'react-dom';
import NewScriptForm from '@cdo/apps/lib/script-editor/NewScriptForm';

$(document).ready(() => {
  const script = document.querySelector('script[data-csrftoken]');
  const csrfToken = script.dataset.csrftoken;

  ReactDOM.render(
    <NewScriptForm csrfToken={csrfToken} />,
    document.getElementById('form')
  );
});
