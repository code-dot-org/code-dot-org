import React from 'react';
import ReactDom from 'react-dom';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

document.addEventListener(
  'DOMContentLoaded',
  () => {
    // Render Markdown
    const container = document.getElementById('markdown');
    if (!container || !container.dataset.markdown) {
      return;
    }

    ReactDom.render(
      React.createElement(SafeMarkdown, container.dataset, null),
      container
    );
  },
  false
);
