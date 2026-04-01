import $ from 'jquery';
import React from 'react';

import ReportAbuseForm from '@cdo/apps/code-studio/components/ReportAbuseForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const props = getScriptData('abuse');
  props.abuseUrl = document.referrer;
  createReactRoot(
    <ReportAbuseForm {...props} />,
    document.getElementById('report-abuse-form')
  );
});
