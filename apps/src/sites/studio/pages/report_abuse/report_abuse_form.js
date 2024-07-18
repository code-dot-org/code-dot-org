import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';

import ReportAbuseForm from '@cdo/apps/code-studio/components/ReportAbuseForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const props = getScriptData('abuse');
  const weblabUrl = window.location.href;
  /*
    If the channelId is in the url, we have appended it there from the weblab
    codeprojects footer. Leave appended url as-is, and let getChannelIdFromUrl
    in reportAbuse.js parse out the channel id. Otherwise, we can retrieve the
    project url directly from document.referrer.
  */
  props.abuseUrl = weblabUrl.includes('channelId')
    ? weblabUrl
    : document.referrer;
  const root = createRoot(document.getElementById('report-abuse-form'));
  root.render(<ReportAbuseForm {...props} />);
});
