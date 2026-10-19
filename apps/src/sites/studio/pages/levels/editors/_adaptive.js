import $ from 'jquery';
import React from 'react';

import PathwayEditor from '@cdo/apps/adaptive/editor/PathwayEditor';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  const container = document.getElementById('adaptive-pathway-editor');
  if (!container) {
    return;
  }
  createReactRoot(
    <PathwayEditor pathwayId={container.dataset.pathwayId} />,
    container
  );
});
