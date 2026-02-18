import React from 'react';
import ReactDOM from 'react-dom';

import AiDiffExitTicket from '@cdo/apps/aiDifferentiation/AiDiffExitTicket';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  displayExitTicket();
});

function displayExitTicket() {
  const exitTicketData = getScriptData('artifact');

  ReactDOM.render(
    <AiDiffExitTicket
      title={exitTicketData['title']}
      updated={new Date(exitTicketData['updated_at'])}
      content={exitTicketData['content']}
    />,
    document.getElementById('show-container')
  );
}
