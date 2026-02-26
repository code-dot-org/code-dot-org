import React from 'react';

import AiDiffExitTicket from '@cdo/apps/aiDifferentiation/AiDiffExitTicket';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  displayExitTicket();
});

function displayExitTicket() {
  const exitTicketData = getScriptData('artifact');

  createReactRoot(
    <AiDiffExitTicket
      title={exitTicketData['title']}
      updated={new Date(exitTicketData['updated_at'])}
      content={exitTicketData['content']}
    />,
    document.getElementById('show-container')
  );
}
