import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import ChooseTemplateLevelDialog from '@cdo/apps/levelbuilder/level-editor/ChooseTemplateLevelDialog';
//import getScriptData from '@cdo/apps/util/getScriptData';

// $(document).ready(initPage);

$(document).ready(function () {
  // $('#plusAnswerContainedLevel').on('click', () => {
  //   $('#plusAnswerContainedLevel')
  //     .prev()
  //     .clone()
  //     .insertBefore('#plusAnswerContainedLevel');
  // });
  //const initialSettings = getScriptData('predictsettings');
  ReactDOM.render(
    <ChooseTemplateLevelDialog
      isOpen={true}
      handleConfirm={() => {}}
      allowMajorCurriculumChanges={true}
    />,
    document.getElementById('template-level-selector')
  );
});
