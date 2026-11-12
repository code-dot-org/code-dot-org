import $ from 'jquery';
import React from 'react';

import EditSpritelabConfig from '@cdo/apps/lab2/levelEditors/spritelabConfig/EditSpritelabConfig';
import {levelConfigFromFlat} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/applyLevelConfig';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const {config, older} = getScriptData('spritelabconfig');

  createReactRoot(
    <EditSpritelabConfig
      initialConfig={config}
      fromOlderProperties={levelConfigFromFlat({
        levelMode: older.level_mode ?? undefined,
        worldStartPattern: older.world_start_pattern ?? undefined,
        worldStartRoles: older.world_start_roles ?? undefined,
      })}
    />,
    document.getElementById('spritelab-config-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
