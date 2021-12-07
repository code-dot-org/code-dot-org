/* global dashboard appOptions */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import Attachments from '@cdo/apps/code-studio/components/Attachments';
import {getStore} from '@cdo/apps/code-studio/redux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';

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

  const store = getStore();

  if (data.is_instructor) {
    store.dispatch(setViewType(ViewType.Instructor));
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
