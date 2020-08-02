import React from 'react';
import ReactDOM from 'react-dom';
import FreeResponse from '../../../../code-studio/components/FreeResponse';

$(document).ready(() => {
  const script = document.querySelector('script[data-freeresponse]');
  const data = JSON.parse(script.dataset.freeresponse);

  window.dashboard.codeStudioLevels.registerGetResult(function getResult() {
    var forceSubmittable =
      window.location.search.indexOf('force_submittable') !== -1;

    return {
      response: encodeURIComponent($('.free-response-textarea').val()),
      submitted: data.level.submittable || forceSubmittable,
      result: true,
      testResult: data.level.test_result
    };
  });

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
