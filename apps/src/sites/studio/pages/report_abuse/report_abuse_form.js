import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import ReportAbuseForm from '@cdo/apps/code-studio/components/ReportAbuseForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const props = getScriptData('abuse');
  const urlParams = new URLSearchParams(window.location.search);

  /*
   Support multiple ways of passing the abuse URL:
   1. projectUrl parameter - for lab2 projects (weblab2, pythonlab)
   2. channelId parameter - for web lab codeprojects footer
   3. document.referrer - fallback when no parameters are provided
 */
  if (urlParams.has('projectUrl')) {
    // New lab2 projects pass the full project URL
    props.abuseUrl = decodeURIComponent(urlParams.get('projectUrl'));
  } else if (urlParams.has('channelId')) {
    // Web Lab: channelId from codeprojects footer, keep original URL for parsing
    props.abuseUrl = window.location.href;
  } else {
    // Fallback to referrer
    props.abuseUrl = document.referrer;
  }

  ReactDOM.render(
    <ReportAbuseForm {...props} />,
    document.getElementById('report-abuse-form')
  );
});
