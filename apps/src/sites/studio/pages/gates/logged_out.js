import React from 'react';
import ReactDOM from 'react-dom';

import {queryParams} from '@cdo/apps/code-studio/utils';
import LinkAccountPage from '@cdo/apps/templates/gates/LinkAccountPage';

document.addEventListener('DOMContentLoaded', function () {
  const urlParams = queryParams();
  const returnToUrlParam = urlParams['return_to']
    ? `?user_return_to=${urlParams['return_to']}`
    : '';

  ReactDOM.render(
    <LinkAccountPage
      sourcePage={urlParams['source_page']}
      newAccountUrl={`/users/sign_up/account_type${returnToUrlParam}`}
      existingAccountUrl={`/users/sign_in${returnToUrlParam}`}
    />,
    document.getElementById('logged-out-page')
  );
});
