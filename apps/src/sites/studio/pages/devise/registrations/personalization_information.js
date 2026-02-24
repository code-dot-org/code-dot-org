import React from 'react';

import PersonalizationCollectorContainer from '@cdo/apps/aiDifferentiation/personalization/PersonalizationCollectorContainer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  createReactRoot(
    <PersonalizationCollectorContainer />,
    document.getElementById('personalization-information')
  );
});
