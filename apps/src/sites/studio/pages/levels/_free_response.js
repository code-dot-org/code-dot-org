/* global dashboard appOptions */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import Attachments from '@cdo/apps/code-studio/components/Attachments';
import {queryParams} from '@cdo/apps/code-studio/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

$(document).ready(() => {
  const data = getScriptData('freeresponse');

  $('.free-response > .markdown-container').each(function() {
    const container = this;
    if (!container.dataset.markdown) {
      return;
    }

    ReactDOM.render(
      React.createElement(SafeMarkdown, container.dataset, null),
      container
    );
  });

  if (
    window.appOptions.readonlyWorkspace &&
    !window.appOptions.submitted &&
    !!queryParams('user_id')
  ) {
    analyticsReporter.sendEvent(EVENTS.TEACHER_VIEWING_STUDENT_WORK, {
      unitId: appOptions.serverScriptId,
      levelId: appOptions.serverLevelId,
      sectionId: queryParams('section_id')
    });
  }

  const attachmentsMountPoint = document.querySelector('#free-response-upload');
  const attachmentsProps = data.attachments_props;
  if (attachmentsMountPoint && attachmentsProps) {
    dashboard.project.getCurrentId = function() {
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
