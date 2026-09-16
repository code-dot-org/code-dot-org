import $ from 'jquery';
import React from 'react';
import ReactDom from 'react-dom';

import levelMarkdownRehypeMap from '@cdo/apps/templates/markdown/levelMarkdownRehypeMap';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

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
      rehypeMap: levelMarkdownRehypeMap,
    };

    ReactDom.render(React.createElement(SafeMarkdown, props, null), container);
  });
});
