import $ from 'jquery';
import React from 'react';

import EditChildLevelSettings from '@cdo/apps/levelbuilder/level-editor/EditChildLevelSettings';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const childLevels = getScriptData('childlevels');

  createReactRoot(
    <EditChildLevelSettings initialChildLevelSettings={childLevels} />,
    document.getElementById('child-level-bubble-choice-editor')
  );
});
