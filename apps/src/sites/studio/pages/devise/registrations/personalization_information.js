import React from 'react';
import ReactDOM from 'react-dom';

import PersonalizationCollectorContainer from '@cdo/apps/aiDifferentiation/personalization/PersonalizationCollectorContainer';

$(document).ready(() => {
  ReactDOM.render(
    <PersonalizationCollectorContainer />,
    document.getElementById('personalization-information')
  );
});
