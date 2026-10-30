import $ from 'jquery';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  // Render Markdown
  $('.content-level > .markdown-container').each(function () {
    const container = this;
    if (!container.dataset.markdown) {
      return;
    }

    const props = {
      ...container.dataset,
      allowEmbeds: container.dataset.allowEmbeds === 'true',
    };

    createReactRoot(React.createElement(SafeMarkdown, props, null), container);
  });
});
