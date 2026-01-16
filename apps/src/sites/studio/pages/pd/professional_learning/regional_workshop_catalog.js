import $ from 'jquery';
import React from 'react';

import RegionalWorkshopCatalog from '@cdo/apps/code-studio/pd/professional_learning/RegionalWorkshopCatalog';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const nationalWorkshops = getScriptData('nationalWorkshops');
  const zipFromSchoolInfo = getScriptData('zipFromSchoolInfo');
  createReactRoot(
    <RegionalWorkshopCatalog
      nationalWorkshops={nationalWorkshops}
      zipFromSchoolInfo={zipFromSchoolInfo}
    />,
    document.getElementById('regional-workshop-catalog')
  );
});
