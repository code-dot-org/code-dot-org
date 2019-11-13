import $ from 'jquery';
import React from 'react';
import ReactDom from 'react-dom';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

$(document).ready(() => {
  // Render Markdown
  $('.content-level > .markdown-container').each(function() {
    if (!this.dataset.markdown) {
      return;
    }

    ReactDom.render(
      React.createElement(SafeMarkdown, this.dataset, null),
      this
    );
  });
});
