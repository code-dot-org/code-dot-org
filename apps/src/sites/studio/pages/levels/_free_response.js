import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import SummaryEntryPoint from '@cdo/apps/templates/levelSummary/SummaryEntryPoint';
import Attachments from '@cdo/apps/code-studio/components/Attachments';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/lib/util/analyticsUtils';
import {Provider} from 'react-redux';
import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {getStore} from '@cdo/apps/redux';

$(document).ready(() => {
  const scriptData = getScriptData('freeresponse');

  $('#summaryEntryPoint').each(function () {
    const container = this;
    const store = getStore();

    ReactDOM.render(
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

    ReactDOM.render(
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

    ReactDOM.render(
      <Attachments
        showUnderageWarning={!appOptions.is13Plus}
        {...attachmentsProps}
      />,
      attachmentsMountPoint
    );
  }
});
