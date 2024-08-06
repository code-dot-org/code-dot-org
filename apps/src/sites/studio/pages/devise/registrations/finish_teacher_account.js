import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import FinishTeacherAccount from '@cdo/apps/signUpFlow/FinishTeacherAccount';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const usIp = getScriptData('usIp');
  ReactDOM.render(
    <FinishTeacherAccount usIp={usIp} />,
    document.getElementById('root')
  );
});
