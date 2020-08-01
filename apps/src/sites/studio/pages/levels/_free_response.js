import React from 'react';
import ReactDOM from 'react-dom';
import FreeResponse from '../../../../code-studio/components/FreeResponse';

$(document).ready(() => {
  const script = document.querySelector('script[data-freeresponse]');
  const data = JSON.parse(script.dataset.freeresponse);

  ReactDOM.render(
    <FreeResponse
      level={data.level}
      readOnly={data.readonly}
      lastAttempt={data.last_attempt}
      showUnderageWarning={data.showUnderageWarning}
    />,
    document.querySelector('#free-response')
  );
});
