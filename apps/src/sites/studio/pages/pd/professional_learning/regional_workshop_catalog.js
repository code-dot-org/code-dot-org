import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import RegionalWorkshopCatalog from '@cdo/apps/code-studio/pd/professional_learning/RegionalWorkshopCatalog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const zipFromSchoolInfo = getScriptData('zipFromSchoolInfo') || '';
  ReactDOM.render(
    <RegionalWorkshopCatalog zipFromSchoolInfo={zipFromSchoolInfo} />,
    document.getElementById('regional-workshop-catalog')
  );
});
