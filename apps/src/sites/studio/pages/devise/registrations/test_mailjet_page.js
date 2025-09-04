import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import TestMailJetPage from '@cdo/apps/testMailJet/TestMailJetPage';

$(document).ready(() => {
  ReactDOM.render(
    <TestMailJetPage />,
    document.getElementById('test-mailjet-page')
  );
});
