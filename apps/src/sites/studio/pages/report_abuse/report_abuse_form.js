import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ReportAbuseForm from '@cdo/apps/code-studio/components/ReportAbuseForm';

$(document).ready(function() {
  const props = getScriptData('abuse');
  props.abuseUrl = document.referrer;
  ReactDOM.render(
    <ReportAbuseForm {...props} />,
    document.getElementById('report-abuse-form')
  );
});
