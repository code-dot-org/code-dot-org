import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import Attachments from '@cdo/apps/code-studio/components/Attachments';
import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/metrics/analyticsUtils';
import {getStore} from '@cdo/apps/redux';
import SummaryEntryPoint from '@cdo/apps/templates/levelSummary/SummaryEntryPoint';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const scriptData = getScriptData('freeresponse');

  $('#summaryEntryPoint').each(function () {
    const container = this;
    const store = getStore();

    createReactRoot(
      <Provider store={store}>
        <InstructorsOnly>
          <SummaryEntryPoint scriptData={scriptData} />
        </InstructorsOnly>
      </Provider>,
      container
    );
  });

  $('.free-response > .markdown-container').each(function () {
    const container = this;
    if (!container.dataset.markdown) {
      return;
    }

    createReactRoot(
      React.createElement(SafeMarkdown, container.dataset, null),
      container
    );
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

    createReactRoot(
      <Attachments
        showUnderageWarning={!appOptions.is13Plus}
        {...attachmentsProps}
      />,
      attachmentsMountPoint
    );
  }
});
