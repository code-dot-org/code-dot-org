import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import Attachments from '@cdo/apps/code-studio/components/Attachments';
import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/metrics/analyticsUtils';
import {getStore} from '@cdo/apps/redux';
import SummaryEntryPoint from '@cdo/apps/templates/levelSummary/SummaryEntryPoint';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const scriptData = getScriptData('freeresponse');

  $('#summaryEntryPoint').each(function () {
    const container = this;
    const store = getStore();

    const root = createRoot(container);

    root.render(<Provider store={store}>
      <InstructorsOnly>
        <SummaryEntryPoint scriptData={scriptData} />
      </InstructorsOnly>
    </Provider>);
  });

  $('.free-response > .markdown-container').each(function () {
    const container = this;
    if (!container.dataset.markdown) {
      return;
    }

    const root = createRoot(container);
    root.render(React.createElement(SafeMarkdown, container.dataset, null));
  });

  if (!appOptions.hasContainedLevels) {
    reportTeacherReviewingStudentNonLabLevel();
  }

  const attachmentsMountPoint = document.querySelector('#free-response-upload');
  const attachmentsProps = scriptData.attachments_props;
  if (attachmentsMountPoint && attachmentsProps) {
    dashboard.project.getCurrentId = function () {
      return appOptions.channel;
    };

    const root = createRoot(attachmentsMountPoint);

    root.render(<Attachments
      showUnderageWarning={!appOptions.is13Plus}
      {...attachmentsProps}
    />);
  }
});
