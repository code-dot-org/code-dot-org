import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDom from 'react-dom';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

$(document).ready(() => {
  $('#markdown.teacher.hide-as-student > .markdown-container').each(
    function () {
      const container = this;
      if (!container.dataset.markdown) {
        return;
      }

      const root = createRoot(container);
      root.render(React.createElement(SafeMarkdown, container.dataset, null));
    }
  );
});
