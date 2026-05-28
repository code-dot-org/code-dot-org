import React from 'react';

import UnitGenerator from '@cdo/apps/levelbuilder/unit-generator/UnitGenerator';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const unitData = getScriptData('unit');

  createReactRoot(
    <UnitGenerator unit={unitData} />,
    document.getElementById('unit-generate-container'),
    {
      legacyReactDomRender: true,
    }
  );
});
