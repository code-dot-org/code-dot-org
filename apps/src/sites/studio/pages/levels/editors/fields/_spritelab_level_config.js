import React from 'react';

import EditSpritelabConfig from '@cdo/apps/lab2/levelEditors/spritelabConfig/EditSpritelabConfig';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

const container = document.getElementById('spritelab-level-config-editor');
if (container) {
  createReactRoot(
    <EditSpritelabConfig
      levelId={getScriptData('levelid')}
      initialConfig={getScriptData('levelconfig')}
      flatProperties={getScriptData('flatproperties')}
      toolboxDefinition={getScriptData('toolboxdefinition')}
    />,
    container
  );
}
