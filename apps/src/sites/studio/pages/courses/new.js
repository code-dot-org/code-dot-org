import React from 'react';
import ReactDOM from 'react-dom';
import NewCourseForm from '@cdo/apps/lib/levelbuilder/course-editor/NewCourseForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  ReactDOM.render(
    <NewCourseForm
      families={getScriptData('families')}
      versionYearOptions={getScriptData('versionYearOptions')}
    />,
    document.getElementById('form')
  );
});
