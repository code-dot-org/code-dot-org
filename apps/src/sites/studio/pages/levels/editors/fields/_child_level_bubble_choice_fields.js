import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import EditChildLevelSettings from '@cdo/apps/levelbuilder/level-editor/EditChildLevelSettings';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const childLevels = getScriptData('childlevels');

  ReactDOM.render(
    <EditChildLevelSettings initialChildLevelSettings={childLevels} />,
    document.getElementById('child-level-bubble-choice-editor')
  );
});
