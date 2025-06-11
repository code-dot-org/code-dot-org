import React from 'react';
import ReactDOM from 'react-dom';

import {queryParams} from '@cdo/apps/code-studio/utils';
import TeacherAccountRequiredPage from '@cdo/apps/templates/gates/TeacherAccountRequiredPage';

document.addEventListener('DOMContentLoaded', function () {
  const urlParams = queryParams();
  const editAccountLink = `/users/edit${
    urlParams['return_to'] ? `?user_return_to=${urlParams['return_to']}` : ''
  }#change-user-type-modal-form`;

  ReactDOM.render(
    <TeacherAccountRequiredPage
      sourcePage={urlParams['source_page']}
      editAccountLink={editAccountLink}
    />,
    document.getElementById('teacher-account-required-page')
  );
});
